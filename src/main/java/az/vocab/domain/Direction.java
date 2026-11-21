package az.vocab.domain;

public enum Direction {
    AZ_TO_EN,
    EN_TO_AZ;

    /** Sualda göstərilən mətn. */
    public String questionText(Word word) {
        return this == AZ_TO_EN ? word.getAz() : word.getEn();
    }

    /** Variantlarda göstərilən (cavab) mətn. */
    public String answerText(Word word) {
        return this == AZ_TO_EN ? word.getEn() : word.getAz();
    }
}
