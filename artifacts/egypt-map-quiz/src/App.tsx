import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Compass,
  Map,
  MapPin,
  Navigation2,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import {
  getGetCityQuizQueryKey,
  getListCitiesQueryKey,
  useGetCityQuiz,
  useListCities,
  useSubmitQuiz,
} from '@workspace/api-client-react';
import type { City, QuizQuestion, QuizResult } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { CAIRO_PREVIEW_BOUNDS, GeographicMap } from '@/components/geographic-map';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const citiesQuery = useListCities({
    query: { queryKey: getListCitiesQueryKey() },
  });
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitError, setSubmitError] = useState('');

  const cityId = selectedCity?.id ?? '';
  const quizQuery = useGetCityQuiz(cityId, {
    query: {
      enabled: Boolean(selectedCity),
      queryKey: getGetCityQuizQueryKey(cityId),
    },
  });
  const submitQuiz = useSubmitQuiz();
  const quiz = quizQuery.data;
  const questions = quiz?.questions ?? [];
  const currentQuestion = questions[questionIndex];
  const isResults = result !== null;
  const isQuizStarted = selectedCity !== null;

  const startCity = (city: City) => {
    setSelectedCity(city);
    setQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setSubmitError('');
  };

  const returnToCities = () => {
    setSelectedCity(null);
    setQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setSubmitError('');
  };

  const chooseAnswer = (question: QuizQuestion, optionId: string) => {
    setAnswers((current) => ({ ...current, [question.id]: optionId }));
    setSubmitError('');
  };

  const finishQuiz = () => {
    if (!selectedCity || questions.length === 0 || questions.some((q) => !answers[q.id])) return;
    setSubmitError('');
    submitQuiz.mutate(
      {
        data: {
          cityId: selectedCity.id,
          answers: questions.map((question) => ({
            questionId: question.id,
            optionId: answers[question.id],
          })),
        },
      },
      {
        onSuccess: (gradedResult) => setResult(gradedResult),
        onError: () => setSubmitError('We couldn’t grade that just yet. Your answers are safe — try again.'),
      },
    );
  };

  const tryAnotherRound = () => {
    if (selectedCity) startCity(selectedCity);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand" aria-label="Around the Corner">
          <span className="brand-mark"><Compass size={21} strokeWidth={1.8} /></span>
          <span className="brand-name">Around the Corner</span>
        </div>
        <div className="top-note"><span className="top-note-dot" /> Made for getting to know your city</div>
      </header>

      {!isQuizStarted && (
        <section className="page-wrap" aria-labelledby="welcome-title">
          <div className="welcome">
            <div>
              <div className="eyebrow">Egypt, one neighborhood at a time</div>
              <h1 id="welcome-title">Know your way<br />around <em>here.</em></h1>
              <p className="welcome-copy">
                A little map-reading, a few familiar names, and suddenly the city feels more like yours.
                Pick a place to begin.
              </p>
            </div>
            <div className="welcome-art">
              <GeographicMap
                cityId="cairo"
                cityName="Cairo"
                mapBounds={CAIRO_PREVIEW_BOUNDS}
                variant="preview"
              />
            </div>
          </div>

          <div className="section-heading">
            <div>
              <h2>Where shall we wander?</h2>
              <p>Choose a city and see how well you know its corners.</p>
            </div>
            {!citiesQuery.isLoading && !citiesQuery.isError && (
              <span className="city-count" data-testid="text-city-count">
                {citiesQuery.data?.length ?? 0} {citiesQuery.data?.length === 1 ? 'city' : 'cities'}
              </span>
            )}
          </div>

          {citiesQuery.isLoading && (
            <div className="loading-grid" aria-label="Loading cities" data-testid="status-cities-loading">
              {[0, 1, 2].map((item) => <div className="skeleton" key={item} />)}
            </div>
          )}
          {citiesQuery.isError && (
            <div className="notice" data-testid="status-cities-error">
              <div>
                <h3>We lost our map for a moment.</h3>
                <p>Give it another try and the city list should be right back.</p>
              </div>
              <button className="primary-button" onClick={() => citiesQuery.refetch()} data-testid="button-retry-cities">
                <RotateCcw size={15} /> Try again
              </button>
            </div>
          )}
          {!citiesQuery.isLoading && !citiesQuery.isError && (citiesQuery.data?.length ?? 0) === 0 && (
            <div className="notice" data-testid="status-cities-empty">
              <div>
                <h3>New streets are on their way.</h3>
                <p>There aren’t any city walks to explore yet. Check back soon.</p>
              </div>
            </div>
          )}
          {!citiesQuery.isLoading && !citiesQuery.isError && (citiesQuery.data?.length ?? 0) > 0 && (
            <div className="city-grid" data-testid="list-cities">
              {citiesQuery.data?.map((city, index) => (
                <button
                  className="city-card"
                  key={city.id}
                  onClick={() => startCity(city)}
                  data-testid={`card-city-${city.id}`}
                  aria-label={`Start ${city.name} quiz`}
                >
                  <span className="city-card-top">
                    <span className="city-card-index">WALK {String(index + 1).padStart(2, '0')}</span>
                    <span className="city-arrow"><ArrowRight size={15} /></span>
                  </span>
                  <h3 data-testid={`text-city-name-${city.id}`}>{city.name}</h3>
                  <span className="city-gov">{city.governorate}</span>
                  <p>{city.tagline} <span aria-hidden="true">·</span> {city.questionCount} stops</p>
                  <span className="city-card-corner" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {isQuizStarted && !isResults && (
        <section className="page-wrap quiz-page" aria-label="City quiz">
          <div className="quiz-head">
            <button className="back-button" onClick={returnToCities} data-testid="button-back-to-cities">
              <ArrowLeft size={15} /> All cities
            </button>
            <div className="quiz-city">
              <strong data-testid="text-quiz-city">{selectedCity.name}</strong>
              <span>{selectedCity.governorate}</span>
            </div>
          </div>

          {quizQuery.isLoading && (
            <div className="quiz-layout" data-testid="status-quiz-loading">
              <div className="skeleton" style={{ minHeight: 430 }} />
              <div className="skeleton" style={{ minHeight: 430 }} />
            </div>
          )}
          {quizQuery.isError && (
            <div className="notice" data-testid="status-quiz-error">
              <div>
                <h3>This walk is taking the long way around.</h3>
                <p>We couldn’t load {selectedCity.name}’s map. Try again, or choose another city.</p>
              </div>
              <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                <button className="quiet-button" onClick={returnToCities} data-testid="button-quiz-error-cities">Choose another</button>
                <button className="primary-button" onClick={() => quizQuery.refetch()} data-testid="button-retry-quiz">
                  <RotateCcw size={15} /> Try again
                </button>
              </div>
            </div>
          )}
          {!quizQuery.isLoading && !quizQuery.isError && quiz && questions.length === 0 && (
            <div className="notice" data-testid="status-quiz-empty">
              <div>
                <h3>No stops on this walk just yet.</h3>
                <p>There aren’t any questions for {selectedCity.name} yet. Choose another city for now.</p>
              </div>
              <button className="primary-button" onClick={returnToCities} data-testid="button-empty-quiz-cities">Choose a city</button>
            </div>
          )}
          {!quizQuery.isLoading && !quizQuery.isError && quiz && currentQuestion && (
            <>
              <div className="progress-line" aria-label={`Question ${questionIndex + 1} of ${questions.length}`}>
                <div className="progress-track">
                  <div className="progress-fill" style={{ transform: `scaleX(${(questionIndex + 1) / questions.length})` }} />
                </div>
                <span className="progress-caption" data-testid="text-question-progress">
                  {String(questionIndex + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
                </span>
              </div>
              <div className="quiz-layout" data-testid="panel-question">
                <GeographicMap
                  cityId={selectedCity.id}
                  cityName={selectedCity.name}
                  mapBounds={quiz.mapBounds}
                  question={currentQuestion}
                />
                <div className="question-card">
                  <div className="question-kicker">
                    <span className="question-kicker-mark">{currentQuestion.kind === 'street' ? <Navigation2 size={14} /> : <MapPin size={14} />}</span>
                    Stop {String(questionIndex + 1).padStart(2, '0')} <span aria-hidden="true">/</span> {currentQuestion.kind}
                  </div>
                  <h1 data-testid={`text-question-${currentQuestion.id}`}>{currentQuestion.prompt}</h1>
                  <p className="question-hint">Take a look at the marked spot. Which name belongs here?</p>
                  <div className="option-list" role="group" aria-label="Choose an answer">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = answers[currentQuestion.id] === option.id;
                      return (
                        <button
                          type="button"
                          className={`option-button${isSelected ? ' is-selected' : ''}`}
                          key={option.id}
                          onClick={() => chooseAnswer(currentQuestion, option.id)}
                          aria-pressed={isSelected}
                          data-testid={`option-${currentQuestion.id}-${option.id}`}
                        >
                          <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                          <span className="option-text">{option.label}</span>
                          {isSelected && <Check size={16} className="option-check" />}
                        </button>
                      );
                    })}
                  </div>
                  {submitError && <div className="submit-error" role="alert" data-testid="status-submit-error">{submitError}</div>}
                  <div className="quiz-actions">
                    <button
                      className="step-back"
                      disabled={questionIndex === 0 || submitQuiz.isPending}
                      onClick={() => setQuestionIndex((index) => Math.max(index - 1, 0))}
                      data-testid="button-previous-question"
                    >
                      Back
                    </button>
                    {questionIndex < questions.length - 1 ? (
                      <button
                        className="primary-button"
                        disabled={!answers[currentQuestion.id]}
                        onClick={() => setQuestionIndex((index) => Math.min(index + 1, questions.length - 1))}
                        data-testid="button-next-question"
                      >
                        Next stop <ArrowRight size={15} />
                      </button>
                    ) : (
                      <button
                        className="primary-button"
                        disabled={!answers[currentQuestion.id] || submitQuiz.isPending || questions.some((question) => !answers[question.id])}
                        onClick={finishQuiz}
                        data-testid="button-submit-quiz"
                      >
                        {submitQuiz.isPending ? 'Checking your route…' : 'See how I did'}
                        {!submitQuiz.isPending && <ArrowRight size={15} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <p className="map-footnote" data-testid="text-map-disclaimer">
                <Map size={12} /> Random local sections; water is blue, gardens are green, and street names appear for landmark stops.
              </p>
            </>
          )}
        </section>
      )}

      {isResults && result && (
        <section className="page-wrap results-page" aria-label="Quiz results">
          <div className="result-hero" data-testid="panel-quiz-results">
            <div className="result-seal"><Sparkles size={21} /></div>
            <div className="eyebrow">Walk complete</div>
            <h1 data-testid="text-results-title">A little more at home<br />in {result.cityName}.</h1>
            <p>You found your way through {result.total} stops. Here’s how it went.</p>
            <div className="result-score">
              <span className="score-big" data-testid="text-score-percent">{result.scorePercent}%</span>
              <span className="score-small">/ {result.correct} of {result.total} right</span>
            </div>
            <div className="grade-pill" data-testid="text-grade">{result.grade}</div>
          </div>
          <div className="results-heading">
            <h2>Your stops</h2>
            <span>{result.results.length} ANSWERS</span>
          </div>
          <div className="result-list" data-testid="list-graded-answers">
            {result.results.map((answer, index) => {
              const question = questions.find((item) => item.id === answer.questionId);
              const selectedLabel = question?.options.find((option) => option.id === answer.selectedOptionId)?.label ?? 'No answer';
              return (
                <div className="result-row" key={answer.questionId} data-testid={`row-result-${answer.questionId}`}>
                  <span className={`result-mark ${answer.isCorrect ? 'good' : 'miss'}`}>
                    {answer.isCorrect ? <CircleCheck size={17} /> : <X size={17} />}
                  </span>
                  <span className="result-row-text">
                    <strong>{answer.isCorrect ? selectedLabel : answer.correctLabel}</strong>
                    <span>{answer.isCorrect ? 'That’s the one.' : `You chose ${selectedLabel}`}</span>
                  </span>
                  <span className="result-row-count">{String(index + 1).padStart(2, '0')}</span>
                </div>
              );
            })}
          </div>
          <div className="result-actions">
            <button className="primary-button" onClick={tryAnotherRound} data-testid="button-play-again">
              <RotateCcw size={15} /> Walk this city again
            </button>
            <button className="quiet-button" onClick={returnToCities} data-testid="button-choose-another-city">
              Choose another city <ArrowRight size={15} />
            </button>
          </div>
        </section>
      )}

      <footer className="footer-note">
        <MapPin size={12} /> A friendly map-reading game for getting to know the places around you.
      </footer>
    </main>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
