"use client";

import {
  type HTMLMotionProps,
  motion,
  type MotionStyle,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

type SpringConfig = {
  stiffness: number;
  damping: number;
  mass: number;
};

type ParallaxCardProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: React.ReactNode;
  contentClassName?: string;
  contentStyle?: MotionStyle;
  glareClassName?: string;
  disabled?: boolean;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  glare?: boolean;
  glareMaxOpacity?: number;
  parallaxShift?: number;
  spring?: Partial<SpringConfig>;
};

const defaultSpring = {
  stiffness: 300,
  damping: 30,
  mass: 0.5,
} satisfies SpringConfig;

function ParallaxCard({
  children,
  className,
  contentClassName,
  contentStyle,
  glareClassName,
  disabled = false,
  maxTilt = 8,
  perspective = 800,
  scale: hoverScale = 1.02,
  glare = true,
  glareMaxOpacity = 0.16,
  parallaxShift = 6,
  spring,
  style,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  ...props
}: ParallaxCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const rectRef = React.useRef<DOMRect | null>(null);
  const [prefersStaticCard, setPrefersStaticCard] = React.useState(false);
  const stiffness = spring?.stiffness ?? defaultSpring.stiffness;
  const damping = spring?.damping ?? defaultSpring.damping;
  const mass = spring?.mass ?? defaultSpring.mass;

  React.useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    const updatePreference = () => {
      setPrefersStaticCard(reducedMotion.matches || !finePointer.matches);
    };

    updatePreference();
    reducedMotion.addEventListener("change", updatePreference);
    finePointer.addEventListener("change", updatePreference);

    return () => {
      reducedMotion.removeEventListener("change", updatePreference);
      finePointer.removeEventListener("change", updatePreference);
    };
  }, []);

  const springConfig = React.useMemo(
    () => ({ stiffness, damping, mass }),
    [stiffness, damping, mass],
  );
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const isHovered = useMotionValue(0);

  const rawRotateY = useTransform(mouseX, [0, 1], [maxTilt, -maxTilt]);
  const rawRotateX = useTransform(mouseY, [0, 1], [-maxTilt, maxTilt]);
  const rawScale = useTransform(isHovered, [0, 1], [1, hoverScale]);
  const rotateX = useSpring(rawRotateX, springConfig);
  const rotateY = useSpring(rawRotateY, springConfig);
  const scale = useSpring(rawScale, springConfig);
  const hoverOpacity = useSpring(isHovered, springConfig);
  const contentX = useSpring(
    useTransform(mouseX, [0, 1], [parallaxShift, -parallaxShift]),
    springConfig,
  );
  const contentY = useSpring(
    useTransform(mouseY, [0, 1], [parallaxShift, -parallaxShift]),
    springConfig,
  );
  const glareX = useTransform(mouseX, [0, 1], [0, 100]);
  const glareY = useTransform(mouseY, [0, 1], [0, 100]);
  const glareOpacity = useTransform(hoverOpacity, [0, 1], [0, glareMaxOpacity]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.38) 0%, transparent 58%)`;
  const isStatic = disabled || prefersStaticCard;
  const cardMotionStyle: MotionStyle = isStatic
    ? {}
    : { transformPerspective: perspective, rotateX, rotateY, scale };
  const contentMotionStyle: MotionStyle = isStatic ? {} : { x: contentX, y: contentY };

  function handleMouseEnter(event: React.MouseEvent<HTMLDivElement>) {
    onMouseEnter?.(event);

    if (isStatic) {
      return;
    }

    rectRef.current = cardRef.current?.getBoundingClientRect() ?? null;
    isHovered.set(1);
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    onMouseMove?.(event);

    if (isStatic || !rectRef.current) {
      return;
    }

    const rect = rectRef.current;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    mouseX.set(Math.max(0, Math.min(1, x)));
    mouseY.set(Math.max(0, Math.min(1, y)));
  }

  function handleMouseLeave(event: React.MouseEvent<HTMLDivElement>) {
    onMouseLeave?.(event);

    if (isStatic) {
      return;
    }

    mouseX.set(0.5);
    mouseY.set(0.5);
    isHovered.set(0);
    rectRef.current = null;
  }

  return (
    <motion.div
      ref={cardRef}
      data-slot="parallax-card"
      className={cn(
        "relative block overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm outline-none",
        className,
      )}
      style={{ ...style, transformStyle: "preserve-3d", ...cardMotionStyle }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <motion.div
        data-slot="parallax-card-content"
        className={cn("relative z-10 h-full scale-[1.03] will-change-transform", contentClassName)}
        style={{ ...contentStyle, ...contentMotionStyle }}
      >
        {children}
      </motion.div>
      {glare && (
        <motion.div
          aria-hidden="true"
          data-slot="parallax-card-glare"
          className={cn(
            "pointer-events-none absolute inset-0 z-20 rounded-[inherit]",
            glareClassName,
          )}
          style={{ background: glareBackground, opacity: isStatic ? 0 : glareOpacity }}
        />
      )}
    </motion.div>
  );
}

export { ParallaxCard };
