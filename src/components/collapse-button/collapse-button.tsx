import React from 'react';
import './collapse-button.css';

export default function (props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} className="collapse-button" aria-hidden="true" data-prefix="fas" data-icon="minus-square" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="">
      <path fill="currentColor" d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM92 296c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h264c6.6 0 12 5.4 12 12v56c0 6.6-5.4 12-12 12H92z"></path>
    </svg>
  );
}
