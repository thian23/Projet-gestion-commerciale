package uvs.ecommerce.exception;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ApiError> notFound(ResourceNotFoundException ex) { return response(HttpStatus.NOT_FOUND, ex.getMessage(), null); }
    @ExceptionHandler({BusinessException.class, DataIntegrityViolationException.class})
    ResponseEntity<ApiError> conflict(Exception ex) {
        String message = ex instanceof BusinessException ? ex.getMessage() : "Operation impossible";
        return response(HttpStatus.CONFLICT, message, null);
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex) {
        var errors = new LinkedHashMap<String, String>();
        ex.getBindingResult().getFieldErrors().forEach(e -> errors.putIfAbsent(e.getField(), e.getDefaultMessage()));
        return response(HttpStatus.BAD_REQUEST, "Donnees invalides", errors);
    }
    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> unexpected(Exception ex) { return response(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur interne", null); }
    private ResponseEntity<ApiError> response(HttpStatus status, String message, java.util.Map<String, String> errors) {
        return ResponseEntity.status(status).body(new ApiError(LocalDateTime.now(), status.value(), message, errors));
    }
}
