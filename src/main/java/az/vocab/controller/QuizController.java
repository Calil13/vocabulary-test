package az.vocab.controller;

import az.vocab.domain.Direction;
import az.vocab.domain.Level;
import az.vocab.dto.AnswerRequest;
import az.vocab.dto.AnswerResponse;
import az.vocab.dto.QuestionResponse;
import az.vocab.service.QuizService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    /** Səhifə açılanda çağırılır: səviyyədəki bütün sözlərin id-ləri təsadüfi sırada. */
    @GetMapping("/order")
    public List<Long> order(@RequestParam Level level) {
        return quizService.shuffledIds(level);
    }

    /** Bir sual: 5 variant (1 düz + 4 səhv), düzgün cavab göstərilmir. */
    @GetMapping("/questions/{wordId}")
    public QuestionResponse question(@PathVariable Long wordId, @RequestParam Direction direction) {
        return quizService.getQuestion(wordId, direction);
    }

    /** Cavabı yoxlayır və düzgün variantı qaytarır. */
    @PostMapping("/questions/{wordId}/answer")
    public AnswerResponse answer(@PathVariable Long wordId, @Valid @RequestBody AnswerRequest request) {
        return quizService.checkAnswer(wordId, request);
    }
}
