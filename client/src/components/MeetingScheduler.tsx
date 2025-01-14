import React from "react";
import {
  Card,
  DatePicker,
  TimePicker,
  Input,
  Button,
  Form,
  Select,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

interface MeetingData {
  title: string;
  date: string;
  time: string;
  participants: string[];
  duration: number;
}

interface MeetingSchedulerProps {
  onSchedule: (meetingData: MeetingData) => Promise<void>;
  isLoading: boolean;
  initialData?: Partial<MeetingData>;
}

interface FormValues {
  title: string;
  date: Dayjs;
  time: Dayjs;
  participants: string;
  duration: number;
}

const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  onSchedule,
  isLoading,
}) => {
  const [form] = Form.useForm<FormValues>();

  const handleSubmit = async (values: FormValues) => {
    const meetingData: MeetingData = {
      title: values.title,
      date: values.date.format("YYYY-MM-DD"), // Format the date
      time: values.time.format("HH:mm"), // Format the time
      participants: values.participants
        .split(",")
        .map((email: string) => email.trim()),
      duration: values.duration,
    };

    await onSchedule(meetingData);
  };

  return (
    <Card>
      <Form<FormValues> form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          rules={[{ required: true, message: "Please enter meeting title" }]}
        >
          <Input prefix={<CalendarOutlined />} placeholder="Meeting Title" />
        </Form.Item>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <Form.Item
            name="date"
            rules={[
              { required: true, message: "Please select date" },
              {
                validator: async (_, value) => {
                  if (value && value.isBefore(dayjs(), "day")) {
                    throw new Error("Cannot schedule meetings in the past");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Select Date"
              disabledDate={(current) =>
                current && current.isBefore(dayjs(), "day")
              }
            />
          </Form.Item>

          <Form.Item
            name="time"
            rules={[{ required: true, message: "Please select time" }]}
          >
            <TimePicker
              style={{ width: "100%" }}
              format="HH:mm"
              placeholder="Select Time"
              prefix={<ClockCircleOutlined />}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="duration"
          rules={[{ required: true, message: "Please select duration" }]}
        >
          <Select placeholder="Select Duration">
            <Select.Option value={30}>30 minutes</Select.Option>
            <Select.Option value={60}>1 hour</Select.Option>
            <Select.Option value={90}>1.5 hours</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="participants"
          rules={[
            { required: true, message: "Please enter participant emails" },
            {
              validator: async (_, value) => {
                if (value) {
                  const emails = value
                    .split(",")
                    .map((email: string) => email.trim());
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  const invalidEmails = emails.filter(
                    (email: string) => !emailRegex.test(email)
                  );
                  if (invalidEmails.length > 0) {
                    throw new Error(
                      `Invalid email(s): ${invalidEmails.join(", ")}`
                    );
                  }
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Participant Emails (comma-separated)"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            Schedule Meeting
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default MeetingScheduler;
