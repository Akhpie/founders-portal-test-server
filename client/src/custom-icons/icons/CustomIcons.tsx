//! All the CUSTOM ICONS in here
import React from "react";

interface CustomIconProps {
  src: string;
  alt?: string;
  className?: string;
  size?: number;
}

const CustomIcons: React.FC<CustomIconProps> = ({
  src,
  alt = "icon",
  className = "",
  size = 20,
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
};

export default CustomIcons;
