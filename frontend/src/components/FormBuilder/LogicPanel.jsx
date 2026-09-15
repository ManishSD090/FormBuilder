import React from 'react';
import { useFormBuilder } from '../../context/FormBuilderContext';
import { Plus, Trash2, X, GitBranch } from 'lucide-react';

/**
 * LogicPanel
 * Renders inside a QuestionCard for questions that support branching:
 * multiple_choice, dropdown.
 *
 * A rule looks like:
 *   { condition: 'equals', value: 'Option A', action: 'jump_to_section', target: '<sectionId>' }
 *
 * Rule execution in FormViewer:
 *   When the respondent selects a value that matches a rule, the viewer
 *   jumps to the target section instead of the next sequential one.
 */
const ACTIONS = [
  { value: 'jump_to_section', label: 'Go to section' },
  { value: 'submit_form',     label: 'Submit form'    },
];

const LogicPanel = ({ question, onClose }) => {
  const { form, updateQuestionLogic } = useFormBuilder();
  const rules = question.logic || [];
  const options = question.options || [];
  const sections = form.sections || [];

  const addRule = () => {
    updateQuestionLogic(question.id, [
      ...rules,
      { condition: 'equals', value: options[0] || '', action: 'jump_to_section', target: sections[0]?.id || '' },
    ]);
  };

  const updateRule = (index, field, value) => {
    const updated = rules.map((r, i) => i === index ? { ...r, [field]: value } : r);
    updateQuestionLogic(question.id, updated);
  };

  const removeRule = (index) => {
    updateQuestionLogic(question.id, rules.filter((_, i) => i !== index));
  };

  const supportedType = ['multiple_choice', 'dropdown'].includes(question.type);

  return (
    <div className="border-t border-gray-100 mt-4 pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-indigo-600">
          <GitBranch size={15} />
          <span className="text-sm font-bold">Conditional Logic</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400">
          <X size={14} />
        </button>
      </div>

      {!supportedType ? (
        <p className="text-xs text-gray-400 italic bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
          Conditional logic is only available for <strong>Multiple Choice</strong> and <strong>Dropdown</strong> questions.
        </p>
      ) : sections.length < 2 ? (
        <p className="text-xs text-gray-400 italic bg-amber-50 rounded-lg px-4 py-3 border border-amber-100">
          Add at least <strong>2 sections</strong> to your form before creating conditional rules.
        </p>
      ) : (
        <>
          {rules.length === 0 && (
            <p className="text-xs text-gray-400 italic mb-3">
              No rules yet. Respondents will move to the next section by default.
            </p>
          )}

          <div className="space-y-3">
            {rules.map((rule, i) => (
              <div key={i} className="flex items-center gap-2 flex-wrap bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 text-sm">
                <span className="text-gray-500 font-medium flex-shrink-0">If answer</span>

                {/* Condition */}
                <select
                  value={rule.condition}
                  onChange={e => updateRule(i, 'condition', e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none"
                >
                  <option value="equals">is</option>
                </select>

                {/* Value */}
                <select
                  value={rule.value}
                  onChange={e => updateRule(i, 'value', e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white flex-1 min-w-0 focus:outline-none"
                >
                  {options.map((opt, oi) => (
                    <option key={oi} value={opt}>{opt || `Option ${oi + 1}`}</option>
                  ))}
                </select>

                <span className="text-gray-500 font-medium flex-shrink-0">then</span>

                {/* Action */}
                <select
                  value={rule.action}
                  onChange={e => updateRule(i, 'action', e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none"
                >
                  {ACTIONS.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>

                {/* Target section (only when jumping) */}
                {rule.action === 'jump_to_section' && (
                  <select
                    value={rule.target}
                    onChange={e => updateRule(i, 'target', e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white flex-1 min-w-0 focus:outline-none"
                  >
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>{s.title || 'Untitled Section'}</option>
                    ))}
                  </select>
                )}

                <button onClick={() => removeRule(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addRule}
            className="mt-3 flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-dashed border-indigo-200 rounded-xl px-4 py-2 hover:bg-indigo-50 transition-all w-full justify-center"
          >
            <Plus size={13} /> Add rule
          </button>
        </>
      )}
    </div>
  );
};

export default LogicPanel;
