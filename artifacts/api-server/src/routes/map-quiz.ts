import { Router, type IRouter } from "express";
import {
  GetCityQuizParams,
  GetCityQuizResponse,
  ListCitiesResponse,
  SubmitQuizBody,
  SubmitQuizResponse,
} from "@workspace/api-zod";
import { quizCities } from "../lib/map-quiz-data";

const router: IRouter = Router();

router.get("/cities", (_req, res) => {
  const cities = quizCities.map(({ questions: _questions, ...city }) => city);
  res.json(ListCitiesResponse.parse(cities));
});

router.get("/cities/:cityId/quiz", (req, res) => {
  const parsedParams = GetCityQuizParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }

  const city = quizCities.find(({ id }) => id === parsedParams.data.cityId);
  if (!city) {
    res.status(404).json({ error: "City not found" });
    return;
  }

  const quiz = {
    city: {
      id: city.id,
      name: city.name,
      governorate: city.governorate,
      tagline: city.tagline,
      questionCount: city.questionCount,
    },
    questions: city.questions.map(
      ({ correctOptionId: _correctOptionId, ...question }) => question,
    ),
  };

  res.json(GetCityQuizResponse.parse(quiz));
});

router.post("/quiz/score", (req, res) => {
  const parsedBody = SubmitQuizBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  const city = quizCities.find(({ id }) => id === parsedBody.data.cityId);
  if (!city) {
    res.status(404).json({ error: "City not found" });
    return;
  }

  const { answers } = parsedBody.data;
  const questionIds = new Set(city.questions.map(({ id }) => id));
  const answerIds = new Set(answers.map(({ questionId }) => questionId));
  const hasValidQuestionIds = answers.every(({ questionId }) =>
    questionIds.has(questionId),
  );
  const hasValidOptions = answers.every((answer) => {
    const question = city.questions.find(({ id }) => id === answer.questionId);
    return question?.options.some(({ id }) => id === answer.optionId) ?? false;
  });

  if (
    answers.length !== city.questions.length ||
    answerIds.size !== answers.length ||
    !hasValidQuestionIds ||
    !hasValidOptions
  ) {
    res.status(400).json({ error: "Submit one valid answer for every question." });
    return;
  }

  const results = city.questions.map((question) => {
    const answer = answers.find(({ questionId }) => questionId === question.id)!;
    const correctOption = question.options.find(
      ({ id }) => id === question.correctOptionId,
    )!;

    return {
      questionId: question.id,
      selectedOptionId: answer.optionId,
      correctOptionId: question.correctOptionId,
      correctLabel: correctOption.label,
      isCorrect: answer.optionId === question.correctOptionId,
    };
  });

  const correct = results.filter(({ isCorrect }) => isCorrect).length;
  const scorePercent = Math.round((correct / city.questions.length) * 100);
  const grade =
    scorePercent >= 90
      ? "Local legend"
      : scorePercent >= 75
        ? "City explorer"
        : scorePercent >= 50
          ? "Getting warmer"
          : "Keep exploring";

  res.json(
    SubmitQuizResponse.parse({
      cityName: city.name,
      correct,
      total: city.questions.length,
      scorePercent,
      grade,
      results,
    }),
  );
});

export default router;