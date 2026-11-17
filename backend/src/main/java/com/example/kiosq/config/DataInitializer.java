package com.example.kiosq.config;

import com.example.kiosq.model.Merchant;
import com.example.kiosq.model.Product;
import com.example.kiosq.repository.MerchantRepository;
import com.example.kiosq.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(
            MerchantRepository merchantRepository,
            ProductRepository productRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // Seed default merchant with email: tola@kiosq.africa / password123
            Merchant merchant = merchantRepository.findByEmail("tola@kiosq.africa").orElseGet(() -> {
                Merchant m = new Merchant(
                        "Chioma Adeleke",
                        "tola@kiosq.africa",
                        "08012345678",
                        passwordEncoder.encode("password123"),
                        "Mama Tola Textiles",
                        "Balogun Market, Lagos Island"
                );
                m.setBankName("Access Bank");
                m.setAccountNumber("0123456789");
                m.setAccountName("Mama Tola Textiles");
                m.setVerified(true);
                return merchantRepository.save(m);
            });

            // Seed demo product if missing
            if (productRepository.findBySlug("ankara-wax").isEmpty()) {
                Product p = new Product();
                p.setSlug("ankara-wax");
                p.setTitle("Authentic Ankara Wax Print (6 Yards)");
                p.setDescription("Teal & Gold Celestial Swirl • 100% Combed Cotton • Grade A Super Wax");
                p.setAskingPrice(new BigDecimal("28000"));
                p.setFloorPrice(new BigDecimal("23000"));
                p.setCategory("Fashion & Fabrics");
                p.setImageUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuAKJfLOn4VRMScTfJqlEtJ9M39g70YXxZSSZ_RABRROV5nCaPrT3yV6Wq_Vl8zH-V3eJ4P-L1-mN3cZ4w-yC1IleipBYtXwlQXYnpWwU_RfpkZ-Xq7H98UQCRsDDdapHalEW4ppP5GV745cCobx5RsGWN-LNxGPBKqAb4Rn3eIuHpI0Z-yb4XeS-HkIc0S1898uDkibmN2nxznGb-CK-AZ6x8D");
                p.setWhatsappCaption("Original Hollandais Ankara 6 yards! Pay into Kiosq Escrow with your 4-digit PIN handoff.");
                p.setMerchant(merchant);
                productRepository.save(p);
            }
        };
    }
}
