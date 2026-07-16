package com.redbanck.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI redbanckOpenApi() {
        final String bearerScheme = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("RedBanck API")
                        .version("1.0.0")
                        .description("""
                                API del sistema bancario digital RedBanck.

                                Autenticación: obtener un access token vía POST /auth/login \
                                y enviarlo como `Authorization: Bearer <token>`. \
                                El access token expira en 15 minutos; renovar con POST /auth/refresh.""")
                        .contact(new Contact().name("Equipo RedBanck").email("dev@redbanck.com")))
                .addSecurityItem(new SecurityRequirement().addList(bearerScheme))
                .components(new Components().addSecuritySchemes(bearerScheme,
                        new SecurityScheme()
                                .name(bearerScheme)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
