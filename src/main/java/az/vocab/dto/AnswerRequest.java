package az.vocab.dto;

import az.vocab.domain.Direction;
import jakarta.validation.constraints.NotNull;

public record AnswerRequest(@NotNull Direction direction, @NotNull Long selectedWordId) {
}
