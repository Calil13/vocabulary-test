package az.vocab.dto;

public record AnswerResponse(boolean correct, Long correctWordId, String correctText) {
}
