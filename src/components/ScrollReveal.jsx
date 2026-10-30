import React, { useEffect, useRef } from 'react';

const revealSelector = 'section, h1, h2, h3, p, .glass-card, main img';

export default function ScrollReveal({ as: Element = 'div', children, ...props }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (
      !root ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.scrollVisible = 'true';
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -6% 0px',
    });

    root.dataset.scrollRevealRoot = 'true';
    const observeTargets = () => {
      const groups = new Map();
      root.querySelectorAll(revealSelector).forEach((element) => {
        if (element.hasAttribute('data-scroll-reveal')) return;
        const siblings = groups.get(element.parentElement) || [];
        siblings.push(element);
        groups.set(element.parentElement, siblings);
      });

      groups.forEach((siblings) => {
        siblings.forEach((element, index) => {
          element.dataset.scrollReveal = 'true';
          element.style.setProperty('--scroll-reveal-delay', `${Math.min(index * 70, 350)}ms`);
          observer.observe(element);
        });
      });
    };

    observeTargets();
    const mutationObserver = new MutationObserver(observeTargets);
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
      delete root.dataset.scrollRevealRoot;
      root.querySelectorAll('[data-scroll-reveal]').forEach((element) => {
        delete element.dataset.scrollReveal;
        delete element.dataset.scrollVisible;
        element.style.removeProperty('--scroll-reveal-delay');
      });
    };
  }, []);

  return (
    <Element data-scroll-reveal-container="" ref={rootRef} {...props}>
      {children}
    </Element>
  );
}
