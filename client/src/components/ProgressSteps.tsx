import { Steps } from 'antd';

interface ProgressStepsProps {
  current: number;
}

export default function ProgressSteps({ current }: ProgressStepsProps) {
  return (
    <Steps
      current={current}
      items={[
        {
          title: 'Login',
          description: 'Account access',
        },
        {
          title: 'Personal Details',
          description: 'Basic information',
        },
        {
          title: 'Company Details',
          description: 'Business information',
        },
      ]}
    />
  );
}