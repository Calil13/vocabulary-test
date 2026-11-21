package az.vocab.dto;

import az.vocab.domain.Level;

public record WordResponse(Long id, Level level, String az, String en) {
}
