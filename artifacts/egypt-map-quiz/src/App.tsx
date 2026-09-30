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
            <div className="welcome-art" aria-hidden="true">
              <svg viewBox="0 0 390 240" fill="none">
                <path d="M-8 61C57 53 60 97 116 83C166 71 153 37 222 41C283 45 272 92 397 74" stroke="#B6C2AE" strokeWidth="17" strokeLinecap="round" />
                <path d="M4 152C60 142 65 190 124 170C181 151 171 130 232 138C299 147 316 175 398 149" stroke="#F8F5EA" strokeWidth="25" strokeLinecap="round" />
                <path d="M85-5C101 42 82 83 104 120C128 160 116 184 139 248M243-8C222 39 255 72 242 108C231 139 263 182 254 246M327-5C300 46 314 66 304 117C294 167 327 199 311 246" stroke="#F8F5EA" strokeWidth="19" strokeLinecap="round" />
                <path d="M-4 111C43 109 74 129 114 118C165 104 182 111 216 113C273 116 293 110 395 111M-5 207C52 191 80 218 132 204C193 187 202 202 244 207C302 214 337 207 400 191" stroke="#C2C8B7" strokeWidth="2" strokeDasharray="3 5" />
                <path d="M31 20L48 31M179 19L196 28M278 202L292 213M159 222L168 232" stroke="#D5B78D" strokeWidth="4" strokeLinecap="round" />
                <circle cx="59" cy="87" r="4" fill="#799781" /><circle cx="187" cy="152" r="4" fill="#799781" /><circle cx="344" cy="113" r="4" fill="#799781" />
              </svg>
              <span className="art-pin" />
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
          {!quizQuery.isLoading && !quizQuery.isError && currentQuestion && (
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
                <SchematicMap question={currentQuestion} cityName={selectedCity.name} />
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
              <p className="map-footnote" data-testid="text-schematic-disclaimer">
                <Map size={12} /> Schematic map for learning only — not for real-world navigation.
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

function SchematicMap({ question, cityName }: { question: QuizQuestion; cityName: string }) {
  const rawX = Number(question.targetX);
  const rawY = Number(question.targetY);
  const normalizedX = rawX >= 0 && rawX <= 1 ? rawX * 100 : rawX;
  const normalizedY = rawY >= 0 && rawY <= 1 ? rawY * 100 : rawY;
  const x = Math.min(92, Math.max(8, normalizedX));
  const y = Math.min(89, Math.max(14, normalizedY));

  return (
    <div className="map-card" data-testid={`map-schematic-${question.id}`} aria-label={`Schematic map of ${cityName}, with an unlabeled target marker`}>
      <div className="map-topline">
        <span className="map-label"><Map size={12} /> Learning map · {cityName}</span>
        <span className="map-north" aria-label="North">N</span>
      </div>
      <svg className="schematic-map" viewBox="0 0 640 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="640" height="500" fill="#e7e7d8" />
        <path d="M-40 141C80 120 130 175 219 146C313 116 349 89 427 117C506 146 561 164 684 120" fill="none" stroke="#cad5c2" strokeWidth="62" strokeLinecap="round" />
        <path d="M-40 141C80 120 130 175 219 146C313 116 349 89 427 117C506 146 561 164 684 120" fill="none" stroke="#f5f2e7" strokeWidth="46" strokeLinecap="round" />
        <path d="M-30 361C74 318 134 394 232 353C332 311 354 336 434 354C519 373 568 338 679 306" fill="none" stroke="#f7f4e9" strokeWidth="48" strokeLinecap="round" />
        <path d="M77 -28C119 51 94 111 137 189C178 263 165 346 198 532M272 -29C242 50 294 95 276 164C256 237 306 298 278 525M489 -35C450 49 491 98 465 167C435 245 494 322 463 527" fill="none" stroke="#f7f4e9" strokeWidth="39" strokeLinecap="round" />
        <path d="M-10 250C98 220 149 263 245 240C335 218 374 239 452 235C531 230 575 205 663 184M-20 445C69 403 115 435 190 417C268 398 337 421 390 433C475 452 537 406 660 390" fill="none" stroke="#c5cebd" strokeWidth="2" strokeDasharray="5 9" />
        <path d="M14 43L54 70M189 34L216 57M348 31L383 61M554 238L591 261M320 458L352 476M54 295L87 317M533 440L572 464" stroke="#d6bd94" strokeWidth="7" strokeLinecap="round" />
        <path d="M55 183L116 202L141 181L174 201M345 188L383 201L414 184L451 197M215 285L249 303L276 284M491 298L525 316L552 290" fill="none" stroke="#d0d6c7" strokeWidth="2" strokeLinecap="round" />
        <path d="M33 388C73 364 107 370 134 388M369 73C392 57 416 61 431 78M533 84C557 69 580 78 596 94" fill="none" stroke="#bdd0b5" strokeWidth="5" strokeLinecap="round" />
        <circle cx="111" cy="235" r="6" fill="#b5c8a9" /><circle cx="400" cy="275" r="7" fill="#b5c8a9" /><circle cx="581" cy="352" r="6" fill="#b5c8a9" />
        <circle cx="332" cy="400" r="5" fill="#b5c8a9" /><circle cx="543" cy="168" r="5" fill="#b5c8a9" />
      </svg>
      <span className="map-dot" style={{ left: `${x}%`, top: `${y}%` }} data-testid={`marker-target-${question.id}`} />
      <span className="map-scale">NORTH IS UP <span aria-hidden="true">·</span> STREET SHAPES ARE APPROXIMATE</span>
    </div>
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
