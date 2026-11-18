package com.example.kiosq.config;

import com.example.kiosq.model.Merchant;
import com.example.kiosq.repository.MerchantRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final MerchantRepository merchantRepository;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, MerchantRepository merchantRepository) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.merchantRepository = merchantRepository;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> {
            Merchant merchant = merchantRepository.findByEmail(email.toLowerCase())
                    .orElseThrow(() -> new UsernameNotFoundException("Merchant not found with email: " + email));

            return new User(
                    merchant.getEmail(),
                    merchant.getPassword(),
                    Collections.emptyList()
            );
        };
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            .authorizeHttpRequests(auth -> auth
                // Error dispatch
                .requestMatchers("/error").permitAll()

                // 1. Auth endpoints
                .requestMatchers("/api/v1/auth/**").permitAll()

                // 2. Public buyer & storefront endpoints (WhatsApp Links)
                .requestMatchers(HttpMethod.GET, "/api/v1/products/*").permitAll()
                .requestMatchers("/api/v1/negotiations/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/escrow/orders").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/escrow/orders/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/escrow/orders/*/dispute").permitAll()

                // 3. Courier Doorstep PIN verification (Riders need zero login)
                .requestMatchers(HttpMethod.POST, "/api/v1/riders/verify-pin").permitAll()

                // 4. Protected Seller Management Endpoints (Require Bearer Token)
                .requestMatchers(HttpMethod.GET, "/api/v1/products").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/v1/merchant/products").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/v1/merchant/orders").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/v1/escrow/orders/*/dispatch").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/v1/products").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/v1/products/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/v1/products/**").authenticated()
                .requestMatchers("/api/v1/dashboard/**").authenticated()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000", "*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
