package az.vocab.dto;

import az.vocab.domain.Direction;
import java.util.List;

public record QuestionResponse(Long wordId,
                               Direction direction,
                               String question,
                               List<OptionResponse> options) {
}
