"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, buttonVariants } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { VariantProps } from "class-variance-authority";
import { ReactNode } from "react";
import Link from "next/link";

interface TrackedLinkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  href: string;
  eventName: string;
  children: ReactNode;
  asChild?: boolean;
  target?: string;
  rel?: string;
}

export function TrackedLinkButton({ 
  href, 
  eventName, 
  children, 
  onClick,
  target,
  rel,
  ...props 
}: TrackedLinkButtonProps) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("/auth");

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    trackEvent(eventName);
    if (onClick) onClick(e as any);
  };

  if (isExternal) {
    return (
      <Button asChild {...props}>
        <a 
          href={href}
          target={target}
          rel={rel}
          onClick={handleClick}
        >
          {children}
        </a>
      </Button>
    );
  }

  return (
    <Button asChild {...props}>
      <Link 
        href={href}
        target={target}
        rel={rel}
        onClick={handleClick}
      >
        {children}
      </Link>
    </Button>
  );
}
