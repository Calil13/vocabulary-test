package az.vocab.service;

import az.vocab.domain.Direction;
import az.vocab.domain.Level;
import az.vocab.domain.Word;
import az.vocab.dto.AnswerRequest;
import az.vocab.dto.AnswerResponse;
import az.vocab.dto.OptionResponse;
import az.vocab.dto.QuestionResponse;
import az.vocab.exception.NotFoundException;
import az.vocab.mapper.WordMapper;
import az.vocab.repository.WordRepository;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QuizService {

    private static final int WRONG_OPTIONS = 4;
    /** Təkrarlanan mətnləri süzmək üçün lazım olandan çox namizəd götürürük. */
    private static final int CANDIDATES = 12;

    private final WordRepository wordRepository;
    private final WordMapper wordMapper;

    /** Seçilmiş səviyyənin bütün söz id-ləri, hər çağırışda təsadüfi sırada. */
    @Transactional(readOnly = true)
    public List<Long> shuffledIds(Level level) {
        List<Long> ids = new ArrayList<>(wordRepository.findIdsByLevel(level));
        Collections.shuffle(ids);
        return ids;
    }

    @Transactional(readOnly = true)
    public QuestionResponse getQuestion(Long wordId, Direction direction) {
        Word word = findWord(wordId);

        List<Word> wrong = pickWrongOptions(word, direction);

        List<OptionResponse> options = new ArrayList<>();
        options.add(wordMapper.toOption(word, direction));
        wrong.forEach(w -> options.add(wordMapper.toOption(w, direction)));
        Collections.shuffle(options);

        return new QuestionResponse(word.getId(), direction, direction.questionText(word), options);
    }

    @Transactional(readOnly = true)
    public AnswerResponse checkAnswer(Long wordId, AnswerRequest request) {
        Word word = findWord(wordId);
        boolean correct = word.getId().equals(request.selectedWordId());
        return new AnswerResponse(correct, word.getId(), request.direction().answerText(word));
    }

    private List<Word> pickWrongOptions(Word word, Direction direction) {
        List<Word> candidates =
                wordRepository.findRandomOthers(word.getId(), word.getAz(), word.getEn(), CANDIDATES);

        // Eyni cavab mətni iki dəfə görünməsin
        Map<String, Word> unique = new LinkedHashMap<>();
        for (Word candidate : candidates) {
            unique.putIfAbsent(direction.answerText(candidate).toLowerCase(), candidate);
            if (unique.size() == WRONG_OPTIONS) {
                break;
            }
        }
        return new ArrayList<>(unique.values());
    }

    private Word findWord(Long id) {
        return wordRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Söz tapılmadı: " + id));
    }
}
