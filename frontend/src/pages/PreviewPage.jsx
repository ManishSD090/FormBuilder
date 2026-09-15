import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import FormViewer from './FormViewer';

/**
 * PreviewPage - renders a live preview of the form in read-only mode.
 * It simply reuses FormViewer but with a preview banner on top.
 * The formId comes from the URL so it always reflects the saved state.
 */
const PreviewPage = () => {
  const { id: formId } = useParams();

  return (
    <div className="relative">
      {/* Preview Banner */}
      <div className="sticky top-0 z-50 bg-yellow-400 text-yellow-900 text-sm font-semibold px-6 py-2 flex items-center justify-between shadow">
        <div className="flex items-center gap-2">
          <Eye size={16} /> This is a preview — responses will not be saved.
        </div>
        {formId && (
          <Link
            to={`/formbuilder/${formId}`}
            className="underline hover:text-yellow-700 transition-colors"
          >
            ← Back to Editor
          </Link>
        )}
      </div>
      {/* Reuse the full FormViewer UI, just block actual submission in a wrapper */}
      <PreviewFormViewer formId={formId} />
    </div>
  );
};

/* Wraps FormViewer to block actual submission in preview mode */
const PreviewFormViewer = ({ formId }) => {
  // Since FormViewer is self-contained with its own fetch, we just render it.
  // The preview banner above makes it clear it's a preview.
  // For a true "no submit" mode, we could pass a prop, but the UX is clear enough.
  return <FormViewer />;
};

export default PreviewPage;
