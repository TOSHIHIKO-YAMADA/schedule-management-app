"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  tapScale?: number;
  href?: string;
  onClick?: () => void;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = "",
  hoverScale = 1.02,
  tapScale = 0.98,
  href,
  onClick
}) => {
  const cardVariants = {
    rest: {
      scale: 1,
      y: 0,
    },
    hover: {
      scale: hoverScale,
      y: -4,
    },
    tap: {
      scale: tapScale,
      y: 0,
    }
  };

  const Component = href ? motion.a : motion.div;
  const props = href ? { href } : {};

  return (
    <Component
      className={`cursor-pointer ${className}`}
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

// ボタン用のインタラクティブコンポーネント
export const InteractiveButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}> = ({
  children,
  className = "",
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false
}) => {
  const buttonVariants = {
    rest: {
      scale: 1,
    },
    hover: {
      scale: disabled ? 1 : 1.05,
    },
    tap: {
      scale: disabled ? 1 : 0.95,
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-white hover:bg-primary/90';
      case 'secondary':
        return 'bg-secondary text-foreground hover:bg-secondary/80';
      case 'ghost':
        return 'bg-transparent text-foreground hover:bg-secondary';
      default:
        return 'bg-primary text-white hover:bg-primary/90';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  return (
    <motion.button
      className={`
        inline-flex items-center justify-center
        rounded-xl font-medium
        transition-colors duration-200
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

// アイコン用のインタラクティブコンポーネント
export const InteractiveIcon: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({
  children,
  className = "",
  onClick
}) => {
  const iconVariants = {
    rest: {
      scale: 1,
      rotate: 0,
    },
    hover: {
      scale: 1.1,
      rotate: 5,
    },
    tap: {
      scale: 0.9,
      rotate: 0,
    }
  };

  return (
    <motion.div
      className={`cursor-pointer ${className}`}
      variants={iconVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

// リスト項目用のインタラクティブコンポーネント
export const InteractiveListItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  index?: number;
}> = ({
  children,
  className = "",
  onClick,
  index = 0
}) => {
  const listItemVariants = {
    rest: {
      x: 0,
      backgroundColor: "rgba(0, 0, 0, 0)",
    },
    hover: {
      x: 4,
      backgroundColor: "rgba(59, 130, 246, 0.05)",
    }
  };

  return (
    <motion.div
      className={`cursor-pointer rounded-lg ${className}`}
      variants={listItemVariants}
      initial="rest"
      whileHover="hover"
      onClick={onClick}
      custom={index}
    >
      {children}
    </motion.div>
  );
};