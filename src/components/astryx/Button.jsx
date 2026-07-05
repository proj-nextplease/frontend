// Swizzled from @astryxdesign/core/Button (facebook/astryx), then re-skinned to
// use NextPlease's own tokens instead of the Astryx "neutral" theme's colorVars.
// Keeps the original interaction logic (loading state + delayed spinner,
// clickAction dedupe, ButtonGroup awareness, href/as polymorphic link rendering,
// tooltip, icon-only aria handling). The original used `@stylexjs/stylex`, which
// requires a build-time babel/vite plugin to compile `stylex.create()` calls —
// this project has no such plugin, so `stylex.create()` throws at runtime
// ("Unexpected 'stylex.create' call at runtime"). Re-implemented with plain CSS
// classes (see .astryx-btn* in index.css) instead, matching how the rest of
// this codebase styles components.
'use client';

import { useRef, useTransition } from 'react';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { Spinner } from '@astryxdesign/core/Spinner';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { useSize } from '@astryxdesign/core/SizeContext';
import { useButtonGroup } from '@astryxdesign/core/ButtonGroup';
import { useLinkComponent } from '@astryxdesign/core/Link';

/**
 * NextPlease's re-skinned Astryx Button. Same API as @astryxdesign/core/Button.
 * When `href` is set (and not disabled), renders through the app's LinkProvider
 * (react-router `Link`) for real client-side navigation.
 */
export function Button({
  label,
  variant = 'secondary',
  size: sizeProp,
  type = 'button',
  isDisabled = false,
  isLoading = false,
  isInterruptible = false,
  clickAction,
  icon,
  isIconOnly = false,
  children,
  endContent,
  tooltip,
  href,
  as,
  target,
  rel,
  className,
  style,
  ref,
  ...props
}) {
  const size = useSize(sizeProp, 'md');
  const buttonGroup = useButtonGroup();

  const [isPending, startTransition] = useTransition();
  const actionInFlightRef = useRef(false);
  const isLoadingState = isLoading || isPending;
  const delaySpinner = isPending || isInterruptible;
  const groupDisabled = buttonGroup?.isDisabled ?? false;
  const buttonDisabled = isDisabled || groupDisabled || (isLoadingState && !isInterruptible);

  const LinkComponent = useLinkComponent(as);
  const renderAsLink = href != null && !buttonDisabled;
  const useAriaDisabled = tooltip != null && buttonDisabled;

  const handleClick = (e) => {
    if (buttonDisabled || (actionInFlightRef.current && !isInterruptible)) {
      e.preventDefault();
      return;
    }
    props.onClick?.(e);
    if (clickAction && !e.defaultPrevented) {
      actionInFlightRef.current = true;
      startTransition(async () => {
        try {
          await clickAction(e);
        } finally {
          actionInFlightRef.current = false;
        }
      });
    }
  };

  const handleKeyDown = useAriaDisabled
    ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
        } else {
          props.onKeyDown?.(e);
        }
      }
    : undefined;

  const classes = [
    'astryx-btn',
    `astryx-btn--${variant}`,
    `astryx-btn--${size}`,
    isIconOnly && 'astryx-btn--icon-only',
    buttonDisabled && 'astryx-btn--disabled',
    renderAsLink && 'astryx-btn--link',
    className,
  ].filter(Boolean).join(' ');

  const buttonContent = (
    <>
      {isLoadingState && (
        <span className={`astryx-btn__spinner-overlay${delaySpinner ? ' astryx-btn__spinner-overlay--delayed' : ''}`} aria-hidden="true">
          <Spinner size="sm" shade="inherit" />
        </span>
      )}
      <span
        className={`astryx-btn__content${isLoadingState ? ' astryx-btn__content--hidden' : ''}`}
        aria-hidden={isLoadingState || undefined}>
        {icon && <span className="astryx-btn__icon">{icon}</span>}
        {isIconOnly ? null : <span className="astryx-btn__label">{children ?? label}</span>}
        {!isIconOnly && endContent && <span className="astryx-btn__end">{endContent}</span>}
      </span>
      <VisuallyHidden role="status" aria-live="polite">
        {isLoadingState ? 'Loading' : ''}
      </VisuallyHidden>
    </>
  );

  const needsAriaLabel = (isIconOnly && label !== '') || (isLoadingState && !isIconOnly) || (children != null && children !== label);
  const ariaLabelProp = needsAriaLabel ? { 'aria-label': label } : null;

  let element;

  if (renderAsLink) {
    element = (
      // eslint-disable-next-line react-hooks/static-components -- polymorphic link component resolved from context, same pattern as upstream Astryx source
      <LinkComponent
        ref={ref}
        href={href}
        target={target}
        rel={rel}
        className={classes}
        style={style}
        {...props}
        {...ariaLabelProp}
        onClick={handleClick}>
        {buttonContent}
      </LinkComponent>
    );
  } else {
    element = (
      <button
        ref={ref}
        type={type}
        disabled={useAriaDisabled ? undefined : buttonDisabled}
        className={classes}
        style={style}
        {...props}
        {...ariaLabelProp}
        aria-busy={isLoadingState || undefined}
        aria-disabled={useAriaDisabled || undefined}
        onClick={handleClick}
        {...(handleKeyDown ? { onKeyDown: handleKeyDown } : null)}>
        {buttonContent}
      </button>
    );
  }

  if (tooltip) {
    return <Tooltip content={tooltip} placement="above">{element}</Tooltip>;
  }

  return element;
}

Button.displayName = 'Button';
