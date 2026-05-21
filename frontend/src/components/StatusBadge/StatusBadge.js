import React from 'react';

import { STATUS_LABELS, STATUS_THEMES } from '../../util/delivery';
import './StatusBadge.css';

const statusBadge = props => {
  const theme = STATUS_THEMES[props.status] || 'neutral';

  return (
    <span className={`status-badge status-badge--${theme}`}>
      {STATUS_LABELS[props.status] || props.status}
    </span>
  );
};

export default statusBadge;
