// Swizzled from @astryxdesign/core/Banner (facebook/astryx), converted from
// StyleX to plain CSS (same reason as Button.jsx: stylex.create() needs a
// build-time babel/vite plugin this project doesn't have, so it throws at
// runtime if used raw). Only change from upstream: the header row always
// vertically centers its content (icon/title/description vs. the dismiss
// button) — upstream only centers when there's a single-line title with no
// description, which left the dismiss "X" pinned to the top when a
// description is present (see .astryx-banner__header below).
'use client';

import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';

const defaultIconNames = { info: 'info', warning: 'warning', error: 'error', success: 'success' };
const statusRole = { info: 'status', warning: 'alert', error: 'alert', success: 'status' };
const statusIconColor = { info: 'accent', warning: 'warning', error: 'error', success: 'success' };

export function Banner({
  status,
  title,
  description,
  icon,
  isDismissable = false,
  onDismiss,
  endContent,
  container = 'card',
  defaultIsExpanded = false,
  children,
  className,
  style,
  ref,
  ...rest
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultIsExpanded);
  const defaultIconName = defaultIconNames[status];
  const role = statusRole[status];
  const iconColor = statusIconColor[status];
  const hasChildren = children != null;

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const showEndArea = endContent != null || isDismissable || hasChildren;
  const showContent = hasChildren && isExpanded;
  const isCard = container === 'card';

  const headerClasses = [
    'astryx-banner__header',
    `astryx-banner__header--${status}`,
    isCard && (showContent ? 'astryx-banner__header--card-with-content' : 'astryx-banner__header--card-standalone'),
    className,
  ].filter(Boolean).join(' ');

  return (
    <div ref={ref} role={role} className="astryx-banner" style={style} {...rest}>
      <div className={headerClasses}>
        <div className="astryx-banner__icon" aria-hidden="true">
          {icon != null ? icon : <Icon icon={defaultIconName} size="md" color={iconColor} />}
        </div>
        <div className="astryx-banner__content">
          <div className="astryx-banner__title">{title}</div>
          {description != null && <div className="astryx-banner__description">{description}</div>}
        </div>
        {showEndArea && (
          <div className="astryx-banner__end">
            {endContent}
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                label={isExpanded ? 'Collapse' : 'Expand'}
                tooltip={isExpanded ? 'Collapse' : 'Expand'}
                icon={<span className={`astryx-banner__chevron${isExpanded ? ' astryx-banner__chevron--expanded' : ''}`}><Icon icon="chevronDown" size="sm" color="inherit" /></span>}
                onClick={handleToggleExpand}
                aria-expanded={isExpanded}
                isIconOnly
              />
            )}
            {isDismissable && (
              <Button
                variant="ghost"
                size="sm"
                label="Dismiss"
                tooltip="Dismiss"
                icon={<Icon icon="close" size="sm" color="inherit" />}
                onClick={handleDismiss}
                isIconOnly
              />
            )}
          </div>
        )}
      </div>
      {showContent && (
        <div className={`astryx-banner__content-area${isCard ? ' astryx-banner__content-area--card' : ''}`}>
          {children}
        </div>
      )}
    </div>
  );
}

Banner.displayName = 'Banner';
