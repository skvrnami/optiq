import { IconExternalLink } from '../icons/ExternalLink';

interface CardSectionLabelProps {
  children: React.ReactNode;
}

export const CardSectionLabel = ({ children }: CardSectionLabelProps) => (
  <span className="text-xs text-gray-500">{children}</span>
);

interface CardSectionValueProps {
  children: React.ReactNode;
  className?: string;
}

export const CardSectionValue = ({ children, className = '' }: CardSectionValueProps) => (
  <div className={`pl-2 min-w-0 ${className}`}>{children}</div>
);

interface CardSectionProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export const CardSection = ({ label, children, className = '' }: CardSectionProps) => (
  <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
    <CardSectionLabel>{label}</CardSectionLabel>
    <CardSectionValue>{children}</CardSectionValue>
  </div>
);

interface CardLinkProps {
  href: string;
  children: React.ReactNode;
  colorClasses: {
    textLink: string;
    textHover: string;
  };
}

export const CardLink = ({ href, children, colorClasses }: CardLinkProps) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`${colorClasses.textLink} ${colorClasses.textHover} flex items-center gap-1 min-w-0`}
  >
    <span className="text-sm truncate">{children}</span>
    <IconExternalLink className="size-4 shrink-0" />
  </a>
);

interface UnknownValueProps {
  textUnknownClass: string;
  placeholder?: string;
}

export const UnknownValue = ({ textUnknownClass, placeholder = 'unknown' }: UnknownValueProps) => (
  <span className={`text-sm italic ${textUnknownClass}`}>{placeholder}</span>
);
