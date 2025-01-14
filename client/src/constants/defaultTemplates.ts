const defaultTemplates = [
  {
    name: "Welcome Newsletter",
    description: "Default template for welcoming new subscribers",
    category: "general",
    isDefault: true,
    thumbnail: "https://your-cdn.com/thumbnails/welcome.jpg",
    content: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(135deg, #ffffff, #f8fafc); color: #1a1a1a; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <!-- Header Section with Purple Gradient -->
            <div style="text-align: center; margin-bottom: 40px; padding: 32px; background: linear-gradient(135deg, #818cf8, #6366f1); border-radius: 12px; color: white; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);">
              <h1 style="font-size: 36px; font-weight: 800; margin: 0 0 16px; color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Welcome aboard! ✨</h1>
              <p style="font-size: 18px; color: rgba(255, 255, 255, 0.9); margin: 0;">We're thrilled to have you join our community</p>
            </div>
            
            <!-- Welcome Message -->
            <div style="background: linear-gradient(to right, #f1f5f9, #ffffff); border-radius: 12px; padding: 32px; margin-bottom: 32px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);">
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px; color: #334155;">Hi {{subscriberName}},</p>
              <p style="font-size: 16px; line-height: 1.6; margin: 0; color: #334155;">Thank you for subscribing! We're excited to share valuable insights and updates with you.</p>
            </div>
            
            <!-- Features Section with Icon Gradients -->
            <div style="background: linear-gradient(135deg, #f1f5f9, #ffffff); border-radius: 12px; padding: 32px; margin-bottom: 32px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
              <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 24px; background: linear-gradient(135deg, #6366f1, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">What you'll receive:</h2>
              
              <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="background: linear-gradient(135deg, #818cf8, #6366f1); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 16px; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);">
                  <span style="font-size: 20px;">📈</span>
                </div>
                <span style="font-size: 16px; color: #334155;">Weekly industry insights and trends</span>
              </div>
              
              <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="background: linear-gradient(135deg, #818cf8, #6366f1); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 16px; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);">
                  <span style="font-size: 20px;">💡</span>
                </div>
                <span style="font-size: 16px; color: #334155;">Exclusive content and analysis</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <div style="background: linear-gradient(135deg, #818cf8, #6366f1); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 16px; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);">
                  <span style="font-size: 20px;">🎉</span>
                </div>
                <span style="font-size: 16px; color: #334155;">Special offers and updates</span>
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="#" style="display: inline-block; background: linear-gradient(135deg, #818cf8, #6366f1); color: #ffffff; padding: 16px 48px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2); transition: all 0.3s ease;">Explore Now</a>
            </div>
            
            <!-- Footer -->
            <p style="font-size: 16px; line-height: 1.6; text-align: center; margin: 0; color: #64748b;">Best regards,<br><span style="color: #334155; font-weight: 600;">The Team</span></p>
          </div>
        `,
  },
  {
    name: "Monthly Newsletter",
    description: "Standard monthly newsletter template",
    category: "general",
    isDefault: true,
    thumbnail: "https://your-cdn.com/thumbnails/monthly.jpg",
    content: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(135deg, #ffffff, #f0f9ff); color: #1a1a1a; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <!-- Header Section with Blue Gradient -->
            <div style="text-align: center; margin-bottom: 40px; padding: 32px; background: linear-gradient(135deg, #60a5fa, #3b82f6); border-radius: 12px; color: white; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);">
              <h1 style="font-size: 36px; font-weight: 800; margin: 0 0 16px; color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Monthly Insights</h1>
              <p style="font-size: 20px; color: rgba(255, 255, 255, 0.9); margin: 0;">{{monthYear}}</p>
            </div>
            
            <!-- Highlights Section -->
            <div style="background: linear-gradient(135deg, #f0f9ff, #ffffff); border-radius: 12px; padding: 32px; margin-bottom: 32px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);">
              <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 24px; background: linear-gradient(135deg, #3b82f6, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">This Month's Highlights</h2>
              <div style="font-size: 16px; line-height: 1.6; color: #334155;">{{highlightsContent}}</div>
            </div>
            
            <!-- Featured Story Section -->
            <div style="background: linear-gradient(135deg, #60a5fa, #3b82f6); border-radius: 12px; padding: 32px; margin-bottom: 32px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2); color: white;">
              <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 24px; color: #ffffff;">Featured Story</h2>
              <div style="font-size: 16px; line-height: 1.6;">{{mainStoryContent}}</div>
            </div>
            
            <!-- Latest Updates Section -->
            <div style="background: linear-gradient(to right, #f0f9ff, #ffffff); border-radius: 12px; padding: 32px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);">
              <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 24px; color: #1e3a8a;">Latest Updates</h2>
              <div style="font-size: 16px; line-height: 1.6; color: #334155;">{{updatesContent}}</div>
            </div>
          </div>
        `,
  },
  {
    name: "Holiday Season",
    description: "Template for holiday season announcements",
    category: "holiday",
    isDefault: true,
    thumbnail: "https://your-cdn.com/thumbnails/holiday.jpg",
    content: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(135deg, #ffffff, #fff7ed); color: #1a1a1a; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <!-- Header Section with Festive Gradient -->
            <div style="text-align: center; margin-bottom: 40px; padding: 32px; background: linear-gradient(135deg, #fb923c, #f97316); border-radius: 12px; color: white; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.2);">
              <h1 style="font-size: 36px; font-weight: 800; margin: 0 0 16px; color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Season's Greetings! ✨</h1>
              <p style="font-size: 18px; color: rgba(255, 255, 255, 0.9); margin: 0;">Wishing you joy and happiness</p>
            </div>
            
            <!-- Greeting Message -->
            <div style="background: linear-gradient(135deg, #fff7ed, #ffffff); border-radius: 12px; padding: 32px; margin-bottom: 32px; box-shadow: 0 2px 4px rgba(249, 115, 22, 0.1);">
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px; color: #7c2d12;">Dear {{subscriberName}},</p>
              <div style="font-size: 16px; line-height: 1.6; color: #9a3412;">{{holidayMessage}}</div>
            </div>
            
            <!-- Special Offers Section -->
            <div style="background: linear-gradient(135deg, #fed7aa, #ffedd5); border-radius: 12px; padding: 32px; margin-bottom: 32px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.1);">
              <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 24px; color: #9a3412;">Holiday Specials</h2>
              <div style="font-size: 16px; line-height: 1.6; color: #7c2d12;">{{specialOffers}}</div>
            </div>
            
            <!-- Footer -->
            <p style="font-size: 16px; line-height: 1.6; text-align: center; margin: 0; background: linear-gradient(135deg, #fb923c, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;">Warm wishes,<br>The Team</p>
          </div>
        `,
  },
  {
    name: "Event Announcement",
    description: "Template for announcing upcoming events",
    category: "event",
    isDefault: true,
    thumbnail: "https://your-cdn.com/thumbnails/event.jpg",
    content: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(135deg, #ffffff, #ecfdf5); color: #1a1a1a; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <!-- Header Section with Green Gradient -->
        <div style="text-align: center; margin-bottom: 40px; padding: 32px; background: linear-gradient(135deg, #34d399, #10b981); border-radius: 12px; color: white; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">
          <h1 style="font-size: 36px; font-weight: 800; margin: 0 0 16px; color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">{{eventName}}</h1>
          <p style="font-size: 18px; color: rgba(255, 255, 255, 0.9); margin: 0;">Join us for this special event</p>
        </div>
        
        <!-- Event Details Section -->
        <div style="background: linear-gradient(135deg, #ecfdf5, #ffffff); border-radius: 12px; padding: 32px; margin-bottom: 32px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);">
          <!-- Date -->
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #34d399, #10b981); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 16px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);">
              <span style="font-size: 20px;">📅</span>
            </div>
            <div>
              <span style="font-size: 16px; color: #047857; font-weight: 600;">Date:</span>
              <span style="font-size: 16px; color: #334155; margin-left: 8px;">{{eventDate}}</span>
            </div>
          </div>
          
          <!-- Time -->
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #34d399, #10b981); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 16px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);">
              <span style="font-size: 20px;">⏰</span>
            </div>
            <div>
              <span style="font-size: 16px; color: #047857; font-weight: 600;">Time:</span>
              <span style="font-size: 16px; color: #334155; margin-left: 8px;">{{eventTime}}</span>
            </div>
          </div>
          
          <!-- Location -->
          <div style="display: flex; align-items: center;">
            <div style="background: linear-gradient(135deg, #34d399, #10b981); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 16px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);">
              <span style="font-size: 20px;">📍</span>
            </div>
            <div>
              <span style="font-size: 16px; color: #047857; font-weight: 600;">Location:</span>
              <span style="font-size: 16px; color: #334155; margin-left: 8px;">{{eventLocation}}</span>
            </div>
          </div>
        </div>
        
        <!-- Event Description -->
        <div style="background: linear-gradient(135deg, #d1fae5, #ffffff); border-radius: 12px; padding: 32px; margin-bottom: 32px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);">
          <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 16px; background: linear-gradient(135deg, #059669, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">About the Event</h2>
          <div style="font-size: 16px; line-height: 1.6; color: #334155;">{{eventDescription}}</div>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center;">
          <a href="{{registrationLink}}" style="display: inline-block; background: linear-gradient(135deg, #34d399, #10b981); color: #ffffff; padding: 16px 48px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); transition: all 0.3s ease;">Register Now</a>
        </div>
      </div>
    `,
  },
];

export default defaultTemplates;
