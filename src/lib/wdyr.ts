// Why Did You Render - Development Performance Monitor
import React from 'react';

if (import.meta.env.DEV) {
  const whyDidYouRender = await import('@welldone-software/why-did-you-render');
  
  whyDidYouRender.default(React, {
    trackAllPureComponents: false, // Only track components we explicitly mark
    trackHooks: true,
    trackExtraHooks: [
      [require('react-router-dom'), 'useNavigate'],
      [require('@tanstack/react-query'), 'useQuery'],
    ],
    logOnDifferentValues: true,
    collapseGroups: true,
    include: [
      // Add component names here to track specific components
      /.*Dashboard.*/,
      /.*Tab.*/,
      /.*Widget.*/,
    ],
    exclude: [
      // Exclude noisy components
      /.*Icon.*/,
      /.*Button.*/,
    ]
  });
}