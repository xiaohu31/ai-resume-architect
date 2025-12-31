
import React, { forwardRef } from 'react';
import { useResumeStore } from '../store';
import { templateRegistry } from './templates';

const PreviewPanel = forwardRef<HTMLDivElement>((props, ref) => {
  const { resume } = useResumeStore();

  const templateId = resume?.settings?.templateId || 'classic';
  const Template = templateRegistry[templateId]?.component || templateRegistry.classic.component;

  const settings = resume?.settings || { fontSize: 11, lineHeight: 1.6 };

  return (
    <div className="relative group/preview">
      <div ref={ref} className="preview-a4 shadow-2xl rounded-sm print:shadow-none bg-white">
        <Template
          resume={resume}
          style={{
            fontSize: settings.fontSize,
            lineHeight: settings.lineHeight,
          }}
        />
      </div>
    </div>
  );
});

PreviewPanel.displayName = 'PreviewPanel';

export default PreviewPanel;
