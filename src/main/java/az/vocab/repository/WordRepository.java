package az.vocab.repository;

import az.vocab.domain.Level;
import az.vocab.domain.Word;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WordRepository extends JpaRepository<Word, Long> {

    @Query("select w.id from Word w where w.level = :level")
    List<Long> findIdsByLevel(@Param("level") Level level);

    /**
     * Bütün səviyyələrdən təsadüfi sözlər. Düzgün cavabla eyni az və ya en mətni olanlar
     * (sinonimlər) çıxarılır ki, səhv variant əslində düzgün cavab olmasın.
     */
    @Query(value = """
            select * from words
            where id <> :id
              and lower(az) <> lower(:az)
              and lower(en) <> lower(:en)
            order by random()
            limit :limit
            """, nativeQuery = true)
    List<Word> findRandomOthers(@Param("id") Long id,
                                @Param("az") String az,
                                @Param("en") String en,
                                @Param("limit") int limit);
}
