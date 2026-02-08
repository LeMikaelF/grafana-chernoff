import React from 'react';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';

interface GroupSectionProps {
  label: string;
  children: React.ReactNode;
}

const getStyles = () => {
  return {
    section: css`
      margin-bottom: 12px;
    `,
    header: css`
      font-size: 13px;
      font-weight: 500;
      opacity: 0.7;
      padding: 4px 8px;
      border-bottom: 1px solid rgba(128, 128, 128, 0.2);
      margin-bottom: 8px;
    `,
  };
};

export const GroupSection: React.FC<GroupSectionProps> = ({ label, children }) => {
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.section}>
      {label && <div className={styles.header}>{label}</div>}
      {children}
    </div>
  );
};
