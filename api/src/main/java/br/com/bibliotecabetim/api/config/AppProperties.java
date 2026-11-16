package br.com.bibliotecabetim.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Cors cors = new Cors();
    private Jwt jwt = new Jwt();
    private Library library = new Library();

    public Cors getCors() {
        return cors;
    }

    public void setCors(Cors cors) {
        this.cors = cors;
    }

    public Jwt getJwt() {
        return jwt;
    }

    public void setJwt(Jwt jwt) {
        this.jwt = jwt;
    }

    public Library getLibrary() {
        return library;
    }

    public void setLibrary(Library library) {
        this.library = library;
    }

    public static class Cors {
        private List<String> allowedOrigins = List.of("http://localhost:5173");

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    public static class Jwt {
        private String secret = "change-me-in-production-min-32-chars";
        private Long expirationMs = 86400000L;

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public Long getExpirationMs() {
            return expirationMs;
        }

        public void setExpirationMs(Long expirationMs) {
            this.expirationMs = expirationMs;
        }
    }

    public static class Library {
        private Integer loanDays = 14;
        private Integer maxRenewals = 2;
        private Integer maxLoansPerUser = 3;
        private Integer reservationHoldHours = 48;

        public Integer getLoanDays() {
            return loanDays;
        }

        public void setLoanDays(Integer loanDays) {
            this.loanDays = loanDays;
        }

        public Integer getMaxRenewals() {
            return maxRenewals;
        }

        public void setMaxRenewals(Integer maxRenewals) {
            this.maxRenewals = maxRenewals;
        }

        public Integer getMaxLoansPerUser() {
            return maxLoansPerUser;
        }

        public void setMaxLoansPerUser(Integer maxLoansPerUser) {
            this.maxLoansPerUser = maxLoansPerUser;
        }

        public Integer getReservationHoldHours() {
            return reservationHoldHours;
        }

        public void setReservationHoldHours(Integer reservationHoldHours) {
            this.reservationHoldHours = reservationHoldHours;
        }
    }
}
