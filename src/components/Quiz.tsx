'use client';

import React, { useEffect, useState } from 'react';
//@ts-ignore
import Quiz from 'react-quiz-component';
import { recordQuizResult } from '../utils/progress';

interface QuizStrings {
  loading: string;
  error: string;
  empty: string;
}

// Subset of react-quiz-component's untyped onComplete payload that we use
interface QuizCompletionResult {
  numberOfCorrectAnswers?: number;
  numberOfQuestions?: number;
}

interface QuizComponentProps {
  url: string;
  strings?: QuizStrings;
}

const DEFAULT_STRINGS: QuizStrings = {
  loading: 'Loading quiz...',
  error: 'Error loading quiz',
  empty: 'No quiz data available',
};

const QuizComponent: React.FC<QuizComponentProps> = ({ url, strings = DEFAULT_STRINGS }) => {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch quiz: ${response.statusText}`);
        }
        const data = await response.json();
        setQuizData(data);
      } catch (err) {
        console.error('Failed to fetch quiz data', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [url]);

  if (loading) {
    return <div className="quiz-loading">{strings.loading}</div>;
  }

  if (error) {
    return <div className="quiz-error">{strings.error}: {error}</div>;
  }

  if (!quizData) {
    return <div className="quiz-error">{strings.empty}</div>;
  }

  return (
    <div className="quiz-container">
      <Quiz
        quiz={quizData}
        shuffle={true}
        onComplete={(result: QuizCompletionResult) =>
          recordQuizResult(url, result?.numberOfCorrectAnswers ?? 0, result?.numberOfQuestions ?? 0)
        }
      />
    </div>
  );
};

export default QuizComponent;
