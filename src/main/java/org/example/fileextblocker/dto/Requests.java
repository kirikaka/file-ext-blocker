package org.example.fileextblocker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class Requests {
    public record ToggleFixedRequest(boolean blocked) {}

    public record AddCustomRequest(
            @NotBlank(message = "확장자를 입력하세요.")
            @Size(max = 20, message = "확장자는 최대 20자입니다.")
            String ext
    ) {}
}
