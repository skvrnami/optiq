import * as PopoverPrimitive from '@radix-ui/react-popover';
import type { ComponentProps } from 'react';

import { cn } from '@/utils/utils';

/**
 * The detail card behind every author, deposition and text tag.
 *
 * Built on Popover rather than HoverCard. HoverCard cannot carry a control:
 * it filters touch pointers out of its open handler, preventDefaults
 * touchstart (which suppresses the synthetic click), and sets tabindex="-1"
 * on every tabbable node inside its own content on each render. Since the
 * filter's Select button lives in this card, that left the dashboard
 * operable by mouse only. Popover's trigger is a real button with
 * aria-expanded, so click, tap, Enter and Space all open it, and the
 * contents stay in the tab order.
 */
const DetailCard = PopoverPrimitive.Root;

const DetailCardTrigger = ({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Trigger>) => (
  <PopoverPrimitive.Trigger
    className={cn(
      // min-w-0 and max-w-full let the truncation inside the trigger resolve
      // against the table cell rather than the trigger's own content width
      'min-w-0 max-w-full rounded-sm text-left outline-none',
      'focus-visible:ring-ring focus-visible:ring-[3px]',
      className
    )}
    {...props}
  />
);

const DetailCardContent = ({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) => (
  // Portalled because all three panels are overflow-hidden and would clip the
  // card at the panel edge; collisionPadding keeps it off the window edge.
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      align={align}
      sideOffset={sideOffset}
      collisionPadding={8}
      className={cn(
        'z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
);

export { DetailCard, DetailCardContent, DetailCardTrigger };
