package org.example.fileextblocker.dto;

import java.util.List;

public class Responses {
    public record FixedDto(String ext, boolean blocked) {}
    public record ExtensionsResponse(List<FixedDto> fixed, List<String> custom) {}
}
