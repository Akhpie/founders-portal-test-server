import { Typography, Card, Progress, List, Checkbox } from "antd";
import { useState, useEffect } from "react";
import axios from "axios";
import { useChecklistStore } from "../store/checklistStore";

const { Title, Paragraph } = Typography;

interface ChecklistItem {
  _id: string;
  text: string;
  done: boolean;
  category: string;
}

export default function Checklist() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchProgress = useChecklistStore((state) => state.fetchProgress);

  useEffect(() => {
    fetchChecklist();
  }, []);

  const fetchChecklist = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/check/getcheck",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.data.length === 0) {
        // Initialize checklist if empty
        const initResponse = await axios.post(
          "http://localhost:5000/api/check/checklist/initialize",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setItems(initResponse.data.data);
      } else {
        setItems(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching checklist:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:5000/api/check/checklist/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItems(
        items.map((item) => (item._id === id ? response.data.data : item))
      );
      await fetchProgress();
    } catch (error) {
      console.error("Error toggling item:", error);
    }
  };

  const progress = Math.round(
    (items.filter((item) => item.done).length / items.length) * 100
  );

  const categories = Array.from(new Set(items.map((item) => item.category)));

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <Title level={2}>Founder's Checklist</Title>
        <Paragraph className="text-gray-600">
          Track your progress and complete important tasks
        </Paragraph>
      </div>

      <Card className="mb-8">
        <div className="text-center">
          <Progress
            type="circle"
            percent={progress}
            format={(percent) => (
              <div>
                <div className="text-2xl font-bold">{percent}%</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            )}
          />
        </div>
      </Card>

      {categories.map((category) => (
        <Card key={category} title={category} className="mb-4">
          <List
            dataSource={items.filter((item) => item.category === category)}
            renderItem={(item) => (
              <List.Item
                className="cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => toggleItem(item._id)}
              >
                <div className="flex items-center w-full p-2">
                  <Checkbox checked={item.done} className="mr-3" />
                  <span
                    className={item.done ? "line-through text-gray-500" : ""}
                  >
                    {item.text}
                  </span>
                </div>
              </List.Item>
            )}
          />
        </Card>
      ))}
    </div>
  );
}
