package org.example.fileextblocker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class Requests {
    public record ToggleFixedRequest(boolean blocked) {}

    public record AddCustomRequest(
            @NotBlank(message = "확장자를 입력하세요.")
            @Size(max = 20, message = "확장자는 최대 20자입니다.")
            @Pattern(regexp = "^[a-zA-Z]+$", message = "커스텀 확장자는 영문자만 입력 가능합니다.")
            String ext
    ) {}

    public record AddFixedRequest(
            @NotBlank(message = "확장자를 입력하세요.")
            @Size(max = 20, message = "확장자는 최대 20자입니다.")
            @Pattern(regexp = "^[a-zA-Z]+$", message = "고정 확장자는 영문자만 입력 가능합니다.")
            String ext
    ) {}
}
