package az.vocab.mapper;

import az.vocab.domain.Direction;
import az.vocab.domain.Word;
import az.vocab.dto.OptionResponse;
import az.vocab.dto.WordResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WordMapper {

    WordResponse toResponse(Word word);

    default OptionResponse toOption(Word word, Direction direction) {
        return new OptionResponse(word.getId(), direction.answerText(word));
    }
}
