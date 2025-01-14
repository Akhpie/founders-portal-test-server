import type { Request, Response, NextFunction } from "express";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import OpenAI from "openai";

// Interfaces
interface MeetingRequest {
  title: string;
  date: string;
  time: string;
  duration: number;
  participants: string[];
}

interface MeetingResponse {
  success: boolean;
  meetingLink?: string;
  eventId?: string;
  message?: string;
}

// Constants
const MEETING_RELATED_PROMPTS = [
  "schedule a meet",
  "schedule a meeting",
  "set up a call",
  "arrange a meeting",
  "book an appointment",
];

const MAX_TOKENS = 1500;
const DEFAULT_TEMPERATURE = 0.7;

// Initialize OpenAI and Google OAuth
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

// Helper Functions
const validateMeetingRequest = (req: MeetingRequest): string | null => {
  if (!req.title) return "Meeting title is required";
  if (!req.date) return "Meeting date is required";
  if (!req.time) return "Meeting time is required";
  if (!req.duration) return "Meeting duration is required";
  if (!req.participants?.length) return "At least one participant is required";
  return null;
};

const createEventRequest = (meetingData: MeetingRequest) => {
  try {
    // Convert Dayjs object to ISO string format
    const date = meetingData.date;
    const time = meetingData.time;

    // Ensure we have valid date and time strings
    if (!date || !time) {
      throw new Error("Invalid date or time provided");
    }

    // Create a properly formatted date-time string
    const startDateTime = new Date(`${date}T${time}`);

    // Validate the date
    if (isNaN(startDateTime.getTime())) {
      throw new Error("Invalid date/time combination");
    }

    const endDateTime = new Date(
      startDateTime.getTime() + meetingData.duration * 60000
    );

    return {
      summary: meetingData.title,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use local timezone
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: meetingData.participants.map((email) => ({
        email,
        responseStatus: "needsAction",
        optional: false,
      })),
      conferenceData: {
        createRequest: {
          requestId: `${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 10 },
        ],
      },
      sendUpdates: "all",
      guestsCanModify: false,
      guestsCanSeeOtherGuests: true,
      notifyAttendees: true,
    };
  } catch (error) {
    console.error("Error creating event request:", error);
    throw new Error("Failed to create event request: Invalid date/time format");
  }
};

// Main Handlers
export const scheduleMeetingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check authentication
    if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
          "https://www.googleapis.com/auth/calendar",
          "https://www.googleapis.com/auth/calendar.events",
        ],
        prompt: "consent",
      });

      res.status(401).json({
        success: false,
        message: "Authentication required",
        authUrl: authUrl,
      });
      return;
    }

    const meetingRequest = req.body as MeetingRequest;

    // Validate request
    const validationError = validateMeetingRequest(meetingRequest);
    if (validationError) {
      res.status(400).json({ success: false, message: validationError });
      return;
    }

    // Create and schedule event
    const event = createEventRequest(meetingRequest);
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
      supportsAttachments: true,
    });

    res.status(200).json({
      success: true,
      meetingLink: response.data.conferenceData?.entryPoints?.[0]?.uri,
      eventId: response.data.id,
    });
  } catch (error) {
    console.error("Meeting scheduling error:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to schedule meeting",
    });
  }
};

export const googleAuthHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    prompt: "consent",
  });
  res.redirect(authUrl);
};

export const googleCallbackHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Store tokens securely - in production, use a database
    // For demo purposes, we're using memory storage
    oauth2Client.credentials = tokens;

    res.redirect("http://localhost:5173?auth=success");
  } catch (error) {
    console.error("Error getting tokens:", error);
    res.redirect("http://localhost:5173?error=auth_failed");
    res.status(500).send("Authentication failed");
  }
};

async function parseSchedulingRequest(
  text: string
): Promise<Partial<MeetingRequest>> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a meeting scheduler assistant. Extract meeting details from the user's message and respond ONLY with a JSON object containing these fields if mentioned:
            - title: string (meeting title/subject, default to "New Meeting" if not specified)
            - date: string (in YYYY-MM-DD format)
            - time: string (in HH:mm format, 24-hour)
            - duration: number (in minutes, default to 30 if not specified)
            - participants: array of strings (email addresses)
            
            Example response format:
            {
              "title": "Project Discussion",
              "date": "2024-12-03",
              "time": "14:00",
              "duration": 60,
              "participants": ["john@example.com"]
            }
            
            Respond ONLY with the JSON object, no other text.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent formatting
      max_tokens: 500,
    });

    const responseText =
      completion.choices[0]?.message?.content?.trim() || "{}";

    // Log the response for debugging
    console.log("GPT Response:", responseText);

    // Try to parse the JSON
    let parsedData = JSON.parse(responseText);

    // Validate and provide defaults
    return {
      title: parsedData.title || "New Meeting",
      date: parsedData.date,
      time: parsedData.time,
      duration: parsedData.duration || 30,
      participants: Array.isArray(parsedData.participants)
        ? parsedData.participants
        : [],
    };
  } catch (error) {
    console.error("Error parsing meeting details:", error);
    // Return a default structure
    return {
      title: "New Meeting",
      date: "",
      time: "",
      duration: 30,
      participants: [],
    };
  }
}

export { MEETING_RELATED_PROMPTS, parseSchedulingRequest };
