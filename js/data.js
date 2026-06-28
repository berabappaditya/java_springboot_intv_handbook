// =============================================================
// data.js — All handbook content lives here.
// To add your real Q&A: replace the `question` and `answer`
// fields inside each category's `questions` array.
// Each answer supports ```java ... ``` fenced code blocks.
// =============================================================

const HANDBOOK_DATA = [
  {
    id: "annotations-easy",
    title: "Spring Boot Annotations — Easy",
    icon: "🌱",
    questions: [
      {
        id: "ae-1",
        question: "What does @SpringBootApplication do?",
        answer: `@SpringBootApplication is a meta-annotation that combines three annotations into one convenient shortcut:

- **@Configuration** — marks the class as a source of bean definitions.
- **@EnableAutoConfiguration** — tells Spring Boot to start auto-configuring beans based on classpath contents.
- **@ComponentScan** — scans the current package and sub-packages for Spring-managed components.

\`\`\`java
@SpringBootApplication
public class MyApp {
    public static void main(String[] args) {
        SpringApplication.run(MyApp.class, args);
    }
}
\`\`\`

You can exclude specific auto-configurations using the \`exclude\` attribute:

\`\`\`java
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })
public class MyApp { }
\`\`\``,
        difficulty: "easy",
        tags: ["annotations", "spring-boot", "auto-configuration"]
      },
      {
        id: "ae-2",
        question: "What is the difference between @Component, @Service, @Repository, and @Controller?",
        answer: `All four are specializations of @Component (they are all stereotype annotations that trigger component scanning), but they carry different semantic meaning and may offer additional behavior:

| Annotation | Purpose | Extra Behavior |
|---|---|---|
| @Component | Generic Spring-managed bean | None |
| @Service | Business-logic layer | None (semantic only) |
| @Repository | Data-access layer | Translates persistence exceptions to Spring's DataAccessException |
| @Controller | Web MVC controller | Enables request mapping; works with @RequestMapping |

\`\`\`java
@Service
public class OrderService {
    // business logic
}

@Repository
public class OrderRepository {
    // data access — exceptions auto-translated
}
\`\`\`

Use the most specific annotation that fits; it improves readability and enables future framework enhancements.`,
        difficulty: "easy",
        tags: ["annotations", "stereotype", "component-scan"]
      },
      {
        id: "ae-3",
        question: "What does @Autowired do, and where can it be applied?",
        answer: `@Autowired tells Spring to inject a matching bean automatically. It can be placed on:

1. **Fields** (least preferred — hard to test)
2. **Setter methods**
3. **Constructors** (preferred — makes dependencies explicit and allows final fields)

\`\`\`java
// Constructor injection (recommended)
@Service
public class OrderService {
    private final PaymentService paymentService;

    @Autowired  // optional when only one constructor exists
    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
\`\`\`

By default, @Autowired is **required** — if no matching bean exists, the context fails to start. Use \`@Autowired(required = false)\` to make it optional.`,
        difficulty: "easy",
        tags: ["annotations", "dependency-injection", "autowired"]
      },
      {
        id: "ae-4",
        question: "What is @Value used for?",
        answer: `@Value injects values from properties files, environment variables, or SpEL expressions into Spring beans.

\`\`\`java
@Component
public class AppConfig {

    @Value("\${app.name}")
    private String appName;

    @Value("\${app.timeout:30}")  // default 30 if property missing
    private int timeout;

    @Value("#{2 * 3}")            // SpEL expression
    private int computed;
}
\`\`\`

Values are read from \`application.properties\` / \`application.yml\` or any PropertySource on the Environment.`,
        difficulty: "easy",
        tags: ["annotations", "configuration", "properties"]
      },
      {
        id: "ae-5",
        question: "What does @RestController differ from @Controller?",
        answer: `@RestController = @Controller + @ResponseBody on every method.

- **@Controller** returns view names (for Thymeleaf/JSP templates); you need @ResponseBody on each method to return raw data.
- **@RestController** always writes the return value directly to the HTTP response body (serialized as JSON/XML by default).

\`\`\`java
// @Controller requires explicit @ResponseBody
@Controller
public class PageController {
    @GetMapping("/home")
    public String home(Model model) { return "home"; } // view name

    @GetMapping("/api/data")
    @ResponseBody
    public Data getData() { return new Data(); }
}

// @RestController — @ResponseBody implicit everywhere
@RestController
public class ApiController {
    @GetMapping("/api/data")
    public Data getData() { return new Data(); }
}
\`\`\``,
        difficulty: "easy",
        tags: ["annotations", "web", "rest", "mvc"]
      },
      {
        id: "ae-6",
        question: "What is @RequestMapping and what are its shortcut variants?",
        answer: `@RequestMapping maps HTTP requests to handler methods or controller classes. It accepts method, path, params, headers, and consumes/produces attributes.

**Shortcut annotations** (Spring 4.3+):

| Shortcut | Equivalent |
|---|---|
| @GetMapping | @RequestMapping(method = GET) |
| @PostMapping | @RequestMapping(method = POST) |
| @PutMapping | @RequestMapping(method = PUT) |
| @DeleteMapping | @RequestMapping(method = DELETE) |
| @PatchMapping | @RequestMapping(method = PATCH) |

\`\`\`java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @GetMapping("/{id}")
    public Order getOrder(@PathVariable Long id) { ... }

    @PostMapping
    public Order createOrder(@RequestBody Order order) { ... }

    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) { ... }
}
\`\`\``,
        difficulty: "easy",
        tags: ["annotations", "web", "mvc", "routing"]
      },
      {
        id: "ae-7",
        question: "What does @PathVariable do?",
        answer: `@PathVariable extracts a value from the URI template and binds it to a method parameter.

\`\`\`java
@GetMapping("/users/{userId}/orders/{orderId}")
public Order getOrder(
        @PathVariable Long userId,
        @PathVariable("orderId") Long id) {
    return orderService.find(userId, id);
}
\`\`\`

- The variable name in the URI template must match the parameter name (or use \`@PathVariable("name")\`).
- Supports type conversion — Spring automatically converts Strings to Long, UUID, etc.`,
        difficulty: "easy",
        tags: ["annotations", "web", "rest"]
      },
      {
        id: "ae-8",
        question: "What is @RequestParam and how does it differ from @PathVariable?",
        answer: `@RequestParam binds **query string parameters** (after '?') to method arguments.
@PathVariable binds **URI path segments** to method arguments.

\`\`\`java
// URL: /products?category=electronics&page=2
@GetMapping("/products")
public List<Product> list(
        @RequestParam String category,
        @RequestParam(defaultValue = "0") int page) {
    return productService.findByCategory(category, page);
}

// URL: /products/42
@GetMapping("/products/{id}")
public Product get(@PathVariable Long id) {
    return productService.findById(id);
}
\`\`\`

Key @RequestParam options: \`required\` (default true), \`defaultValue\`, \`name\`.`,
        difficulty: "easy",
        tags: ["annotations", "web", "query-params"]
      },
      {
        id: "ae-9",
        question: "What does @Bean do and how is it different from @Component?",
        answer: `Both register beans in the Spring container, but they are used in different scenarios:

| | @Component | @Bean |
|---|---|---|
| Placed on | Class | Method inside @Configuration class |
| When to use | You own the source code | Third-party classes or when construction needs logic |
| Registration | Via component scan | Explicit method call |

\`\`\`java
// @Component — you own the class
@Component
public class EmailService { ... }

// @Bean — third-party or needs setup
@Configuration
public class AppConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper om = new ObjectMapper();
        om.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return om;
    }
}
\`\`\``,
        difficulty: "easy",
        tags: ["annotations", "beans", "configuration"]
      },
      {
        id: "ae-10",
        question: "What is @Configuration?",
        answer: `@Configuration marks a class as a source of bean definitions. Methods annotated with @Bean inside it are intercepted by CGLIB to ensure singleton semantics — calling a @Bean method multiple times returns the same instance.

\`\`\`java
@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource() {
        return DataSourceBuilder.create()
            .url("jdbc:h2:mem:testdb")
            .build();
    }

    @Bean
    public JdbcTemplate jdbcTemplate() {
        // Calling dataSource() here returns the same bean — not a new instance
        return new JdbcTemplate(dataSource());
    }
}
\`\`\`

Without @Configuration (using @Component instead), each call to \`dataSource()\` would create a **new** DataSource — a common subtle bug.`,
        difficulty: "easy",
        tags: ["annotations", "configuration", "beans"]
      }
    ]
  },

  {
    id: "annotations-medium",
    title: "Spring Boot Annotations — Medium",
    icon: "⚙️",
    questions: [
      {
        id: "am-1",
        question: "How does @Conditional and its variants work?",
        answer: `@Conditional registers a bean only when a given Condition implementation returns true. Spring Boot ships many ready-made variants:

| Annotation | Condition |
|---|---|
| @ConditionalOnProperty | A property has a specific value |
| @ConditionalOnClass | A class is on the classpath |
| @ConditionalOnMissingBean | No bean of that type exists yet |
| @ConditionalOnBean | A specific bean already exists |
| @ConditionalOnWebApplication | Running in a web context |

\`\`\`java
@Configuration
public class CacheConfig {

    // Only register if 'cache.enabled=true' in properties
    @Bean
    @ConditionalOnProperty(name = "cache.enabled", havingValue = "true")
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager();
    }

    // Only if no other CacheManager bean is defined
    @Bean
    @ConditionalOnMissingBean(CacheManager.class)
    public CacheManager noOpCacheManager() {
        return new NoOpCacheManager();
    }
}
\`\`\`

These are the backbone of Spring Boot auto-configuration.`,
        difficulty: "medium",
        tags: ["annotations", "conditional", "auto-configuration"]
      },
      {
        id: "am-2",
        question: "What is @Transactional and what are its propagation levels?",
        answer: `@Transactional demarcates a transactional boundary. Spring wraps the method in a proxy that begins/commits/rolls back the transaction.

**Key attributes:**
- \`propagation\` — how the method participates in an existing transaction
- \`isolation\` — isolation level for the transaction
- \`rollbackFor\` — exception types that trigger rollback (default: unchecked exceptions)
- \`readOnly\` — hint to the provider for optimization

**Propagation types:**

| Propagation | Behavior |
|---|---|
| REQUIRED (default) | Join existing tx; create one if none |
| REQUIRES_NEW | Always create a new tx; suspend existing |
| NESTED | Run inside a nested tx (savepoint) |
| SUPPORTS | Join if exists; non-transactional otherwise |
| NOT_SUPPORTED | Suspend existing tx; run non-transactionally |
| MANDATORY | Must have existing tx; else exception |
| NEVER | Must NOT have existing tx; else exception |

\`\`\`java
@Service
public class OrderService {

    @Transactional(rollbackFor = Exception.class)
    public void placeOrder(Order order) {
        orderRepo.save(order);
        paymentService.charge(order); // if this throws, whole tx rolls back
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAudit(String event) {
        // runs in its OWN transaction — not rolled back with the outer one
        auditRepo.save(new AuditLog(event));
    }
}
\`\`\`

**Gotcha:** @Transactional only works on public methods called via the Spring proxy (i.e., from outside the bean). Self-invocation bypasses the proxy.`,
        difficulty: "medium",
        tags: ["annotations", "transactions", "database"]
      },
      {
        id: "am-3",
        question: "Explain @Scope and the available bean scopes in Spring.",
        answer: `@Scope defines how long a bean instance lives and how many instances exist.

| Scope | Lifecycle |
|---|---|
| singleton (default) | One instance per Spring container |
| prototype | New instance on every getBean() / injection |
| request | One per HTTP request (web contexts) |
| session | One per HTTP session |
| application | One per ServletContext |
| websocket | One per WebSocket session |

\`\`\`java
@Component
@Scope("prototype")
public class ReportGenerator {
    // new instance created each time it's injected
}

// Injecting a prototype into a singleton safely:
@Component
public class ReportService {

    @Autowired
    private ApplicationContext ctx;

    public void generate() {
        ReportGenerator gen = ctx.getBean(ReportGenerator.class); // fresh instance
    }
}
\`\`\`

For web scopes, inject a **scoped proxy** so a singleton can hold a reference to a shorter-lived bean:

\`\`\`java
@Component
@Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class RequestContext { ... }
\`\`\``,
        difficulty: "medium",
        tags: ["annotations", "beans", "scope"]
      },
      {
        id: "am-4",
        question: "What is @Profile and how do you activate profiles?",
        answer: `@Profile registers beans only when a specific Spring profile is active. It is useful for environment-specific configuration (dev/test/prod).

\`\`\`java
@Configuration
@Profile("dev")
public class DevDataSourceConfig {
    @Bean
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.H2).build();
    }
}

@Configuration
@Profile("prod")
public class ProdDataSourceConfig {
    @Bean
    public DataSource dataSource() {
        // real connection pool
    }
}
\`\`\`

**Activating profiles:**
1. \`application.properties\`: \`spring.profiles.active=dev\`
2. Environment variable: \`SPRING_PROFILES_ACTIVE=prod\`
3. JVM argument: \`-Dspring.profiles.active=prod\`
4. Programmatically: \`SpringApplication.setAdditionalProfiles("dev")\`

You can also use \`@Profile("!prod")\` (negation) or \`@Profile({"dev","test"})\` (multiple).`,
        difficulty: "medium",
        tags: ["annotations", "profiles", "configuration"]
      },
      {
        id: "am-5",
        question: "How does @Async work and what are its requirements?",
        answer: `@Async marks a method to run in a separate thread from a task executor, returning immediately to the caller.

**Requirements:**
1. Enable async support with @EnableAsync on a @Configuration class.
2. The @Async method must be public.
3. Must be called from outside the bean (proxy limitation — same as @Transactional).

\`\`\`java
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(4);
        exec.setMaxPoolSize(10);
        exec.setQueueCapacity(100);
        exec.setThreadNamePrefix("async-");
        exec.initialize();
        return exec;
    }
}

@Service
public class EmailService {

    @Async
    public CompletableFuture<Void> sendWelcomeEmail(String to) {
        // runs in async thread pool
        mailer.send(to, "Welcome!");
        return CompletableFuture.completedFuture(null);
    }
}
\`\`\`

Return types: void, Future<T>, CompletableFuture<T>, or ListenableFuture<T>.`,
        difficulty: "medium",
        tags: ["annotations", "async", "threading"]
      },
      {
        id: "am-6",
        question: "What is @EventListener and how does Spring's event system work?",
        answer: `Spring provides a built-in pub/sub event system. Publish with ApplicationEventPublisher; listen with @EventListener.

\`\`\`java
// 1. Define an event (any object; extend ApplicationEvent for legacy API)
public record OrderPlacedEvent(Long orderId) {}

// 2. Publish the event
@Service
public class OrderService {
    private final ApplicationEventPublisher publisher;

    public void placeOrder(Order order) {
        orderRepo.save(order);
        publisher.publishEvent(new OrderPlacedEvent(order.getId()));
    }
}

// 3. Listen for the event
@Component
public class InventoryListener {

    @EventListener
    public void onOrderPlaced(OrderPlacedEvent event) {
        inventoryService.reserveItems(event.orderId());
    }

    // Async + conditional
    @Async
    @EventListener(condition = "#event.orderId > 0")
    public void sendConfirmation(OrderPlacedEvent event) {
        emailService.send(event.orderId());
    }
}
\`\`\`

Events are synchronous by default. Combine with @Async to decouple processing.`,
        difficulty: "medium",
        tags: ["annotations", "events", "pub-sub"]
      },
      {
        id: "am-7",
        question: "Explain @Cacheable, @CachePut, and @CacheEvict.",
        answer: `Spring's declarative caching annotations require @EnableCaching on a configuration class.

| Annotation | Behavior |
|---|---|
| @Cacheable | Returns cached result if key exists; else executes method and caches result |
| @CachePut | Always executes method; updates (puts) the cache with result |
| @CacheEvict | Removes one or all entries from cache |

\`\`\`java
@Service
public class ProductService {

    @Cacheable(value = "products", key = "#id")
    public Product findById(Long id) {
        return repo.findById(id).orElseThrow();
    }

    @CachePut(value = "products", key = "#product.id")
    public Product update(Product product) {
        return repo.save(product);
    }

    @CacheEvict(value = "products", key = "#id")
    public void delete(Long id) {
        repo.deleteById(id);
    }

    // Clear entire cache
    @CacheEvict(value = "products", allEntries = true)
    public void clearAll() {}
}
\`\`\`

Cache provider is pluggable: ConcurrentHashMap (default), Redis, EhCache, Caffeine, etc.`,
        difficulty: "medium",
        tags: ["annotations", "caching", "performance"]
      },
      {
        id: "am-8",
        question: "What is @ControllerAdvice and @ExceptionHandler?",
        answer: `@ControllerAdvice is a specialization of @Component that applies cross-cutting advice (like exception handling) to all controllers globally.

\`\`\`java
@RestControllerAdvice  // = @ControllerAdvice + @ResponseBody
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(ResourceNotFoundException ex) {
        return new ErrorResponse("NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors()
            .stream().map(FieldError::getDefaultMessage).toList();
        return new ErrorResponse("VALIDATION_FAILED", errors.toString());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleAll(Exception ex) {
        return new ErrorResponse("INTERNAL_ERROR", "Unexpected error occurred");
    }
}
\`\`\`

You can scope @ControllerAdvice to specific packages or controller types using \`basePackages\` or \`assignableTypes\`.`,
        difficulty: "medium",
        tags: ["annotations", "exception-handling", "web"]
      },
      {
        id: "am-9",
        question: "What does @Validated vs @Valid do?",
        answer: `Both trigger Bean Validation (JSR-380), but with an important difference:

| | @Valid | @Validated |
|---|---|---|
| Source | Jakarta Validation API | Spring framework |
| Cascade validation | Yes (via @Valid on nested objects) | Yes |
| Validation groups | No | Yes |
| Can be on class | No | Yes (for method-level validation via AOP) |

\`\`\`java
// @Valid — basic cascaded validation in controller
@PostMapping("/users")
public ResponseEntity<User> create(@Valid @RequestBody UserDto dto) { ... }

// @Validated with groups — for partial validation
public interface OnCreate {}
public interface OnUpdate {}

public class UserDto {
    @Null(groups = OnCreate.class)
    @NotNull(groups = OnUpdate.class)
    private Long id;

    @NotBlank
    private String name;
}

@Service
@Validated
public class UserService {
    public void create(@Validated(OnCreate.class) UserDto dto) { ... }
    public void update(@Validated(OnUpdate.class) UserDto dto) { ... }
}
\`\`\``,
        difficulty: "medium",
        tags: ["annotations", "validation", "bean-validation"]
      },
      {
        id: "am-10",
        question: "How does @Scheduled work and what are its options?",
        answer: `@Scheduled enables task scheduling. Requires @EnableScheduling on a configuration class.

**Scheduling options:**

\`\`\`java
@Component
public class ReportScheduler {

    // Fixed rate: runs every 5 seconds (regardless of execution time)
    @Scheduled(fixedRate = 5000)
    public void pollMetrics() { ... }

    // Fixed delay: waits 5 seconds AFTER previous execution completes
    @Scheduled(fixedDelay = 5000)
    public void processQueue() { ... }

    // Cron expression: every day at 9:00 AM
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendDailyReport() { ... }

    // With initial delay: waits 10s before first run
    @Scheduled(fixedRate = 60000, initialDelay = 10000)
    public void warmupTask() { ... }
}
\`\`\`

**Cron format:** \`second minute hour day-of-month month day-of-week\`

Scheduled tasks run in a single thread by default. Configure a TaskScheduler bean to use a thread pool.`,
        difficulty: "medium",
        tags: ["annotations", "scheduling", "cron"]
      }
    ]
  },

  {
    id: "annotations-hard",
    title: "Spring Boot Annotations — Hard",
    icon: "🔥",
    questions: [
      {
        id: "ah-1",
        question: "How does Spring Boot auto-configuration actually work internally?",
        answer: `Auto-configuration is driven by the **SpringFactoriesLoader** mechanism (pre-Boot 3) or **@ImportAutoConfiguration** / \`AutoConfiguration.imports\` (Boot 3+).

**Step-by-step flow:**

1. \`@SpringBootApplication\` includes \`@EnableAutoConfiguration\`.
2. \`@EnableAutoConfiguration\` imports \`AutoConfigurationImportSelector\`.
3. The selector reads \`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports\` (Boot 3) to get a list of auto-configuration class names.
4. Each auto-configuration class is annotated with \`@AutoConfiguration\` (= @Configuration + ordering hints) and conditionals like \`@ConditionalOnClass\`.
5. Only conditions that pass result in beans being registered.

\`\`\`java
// Example of what a real auto-configuration looks like internally:
@AutoConfiguration(after = DataSourceAutoConfiguration.class)
@ConditionalOnClass({ DataSource.class, JdbcTemplate.class })
@ConditionalOnSingleCandidate(DataSource.class)
@EnableConfigurationProperties(JdbcProperties.class)
public class JdbcTemplateAutoConfiguration {

    @Bean
    @Primary
    @ConditionalOnMissingBean(JdbcOperations.class)
    JdbcTemplate jdbcTemplate(DataSource ds, JdbcProperties props) {
        JdbcTemplate tmpl = new JdbcTemplate(ds);
        tmpl.setFetchSize(props.getTemplate().getFetchSize());
        return tmpl;
    }
}
\`\`\`

**Debugging:** Run with \`--debug\` flag to get an auto-configuration report (positive matches, negative matches, exclusions).`,
        difficulty: "hard",
        tags: ["auto-configuration", "internals", "spring-boot"]
      },
      {
        id: "ah-2",
        question: "Explain Spring AOP, proxy types, and how @Transactional's proxy limitation works.",
        answer: `Spring AOP works by wrapping beans in **proxies**. When you call a method on a Spring bean from outside, you're calling the proxy, which applies advice (before/after/around) and then delegates to the real object.

**Two proxy types:**
1. **JDK dynamic proxy** — used when the bean implements an interface. The proxy implements the same interface.
2. **CGLIB proxy** — used when no interface exists (or \`proxyTargetClass=true\`). CGLIB subclasses the bean class at runtime.

\`\`\`
Client → [Spring CGLIB/JDK Proxy] → [Real Bean]
                ↑ AOP advice runs here
\`\`\`

**The self-invocation problem:**

\`\`\`java
@Service
public class OrderService {

    @Transactional
    public void placeOrder() {
        // ...
        this.sendConfirmation(); // BYPASSES PROXY — no transaction on sendConfirmation!
    }

    @Transactional(propagation = REQUIRES_NEW)
    public void sendConfirmation() { ... } // won't get its own tx
}
\`\`\`

**Solutions:**
1. Move \`sendConfirmation\` to a separate bean.
2. Inject self: \`@Autowired private OrderService self;\` then \`self.sendConfirmation()\`.
3. Use \`AopContext.currentProxy()\` (requires \`exposeProxy=true\`).

**AspectJ** (compile/load-time weaving) bypasses the proxy entirely and is the only full solution for self-invocation.`,
        difficulty: "hard",
        tags: ["aop", "proxy", "transactions", "internals"]
      },
      {
        id: "ah-3",
        question: "What are @Import, @ImportResource, and @ImportAutoConfiguration, and when do you need each?",
        answer: `These three annotations all bring external configuration into the Spring context, but serve different purposes:

**@Import** — imports one or more @Configuration classes, ImportSelector, or ImportBeanDefinitionRegistrar implementations:

\`\`\`java
@Configuration
@Import({ SecurityConfig.class, CacheConfig.class })
public class AppConfig { }

// ImportSelector — programmatically decide what to import
public class MySelector implements ImportSelector {
    @Override
    public String[] selectImports(AnnotationMetadata meta) {
        return new String[]{ "com.example.BeanA", "com.example.BeanB" };
    }
}
\`\`\`

**@ImportResource** — imports XML bean definition files (legacy interop):

\`\`\`java
@Configuration
@ImportResource("classpath:legacy-beans.xml")
public class LegacyConfig { }
\`\`\`

**@ImportAutoConfiguration** — used in tests or libraries to explicitly load specific auto-configurations without triggering the full auto-config scan:

\`\`\`java
@DataJpaTest  // internally uses @ImportAutoConfiguration
// loads only JPA-related auto-configurations
\`\`\`

Use @Import for modular configuration composition; avoid @ImportResource unless integrating with legacy XML; use @ImportAutoConfiguration in test slices.`,
        difficulty: "hard",
        tags: ["annotations", "configuration", "import", "testing"]
      },
      {
        id: "ah-4",
        question: "How do you write a custom Spring Boot starter?",
        answer: `A custom starter is a Maven/Gradle module that auto-configures functionality when added to the classpath. It follows a naming convention: \`acme-spring-boot-starter\`.

**Steps:**

1. **Create the autoconfigure module** with your @AutoConfiguration class:

\`\`\`java
@AutoConfiguration
@ConditionalOnClass(AcmeClient.class)
@EnableConfigurationProperties(AcmeProperties.class)
public class AcmeAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public AcmeClient acmeClient(AcmeProperties props) {
        return new AcmeClient(props.getApiKey(), props.getBaseUrl());
    }
}
\`\`\`

2. **Register** in \`src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports\`:

\`\`\`
com.acme.AcmeAutoConfiguration
\`\`\`

3. **Define properties** with @ConfigurationProperties:

\`\`\`java
@ConfigurationProperties(prefix = "acme")
public class AcmeProperties {
    private String apiKey;
    private String baseUrl = "https://api.acme.com";
    // getters/setters
}
\`\`\`

4. **Create the starter module** (thin wrapper, just pulls in autoconfigure + the library as dependencies).

5. Generate **configuration metadata** with \`spring-boot-configuration-processor\` for IDE auto-complete.`,
        difficulty: "hard",
        tags: ["starter", "auto-configuration", "library", "advanced"]
      },
      {
        id: "ah-5",
        question: "How do bean lifecycle callbacks work? Compare @PostConstruct, InitializingBean, and init-method.",
        answer: `Spring calls initialization and destruction callbacks in a defined order. Three mechanisms exist for each phase:

**Initialization order:**
1. \`@PostConstruct\` method
2. \`InitializingBean.afterPropertiesSet()\`
3. Custom \`init-method\` (from @Bean or XML)

**Destruction order:**
1. \`@PreDestroy\` method
2. \`DisposableBean.destroy()\`
3. Custom \`destroy-method\`

\`\`\`java
@Component
public class ConnectionPool implements InitializingBean, DisposableBean {

    @PostConstruct
    public void init() {
        System.out.println("1. @PostConstruct");
    }

    @Override
    public void afterPropertiesSet() {
        System.out.println("2. InitializingBean.afterPropertiesSet");
    }

    // @Bean(initMethod="customInit") would run 3rd
    public void customInit() {
        System.out.println("3. init-method");
    }

    @PreDestroy
    public void cleanup() {
        System.out.println("1. @PreDestroy");
    }

    @Override
    public void destroy() {
        System.out.println("2. DisposableBean.destroy");
    }
}
\`\`\`

**Recommendation:** Prefer @PostConstruct / @PreDestroy — they're standard Java (JSR-250), not Spring-specific, and keep the class loosely coupled.

**Note:** For prototype-scoped beans, Spring does NOT call @PreDestroy / destroy callbacks.`,
        difficulty: "hard",
        tags: ["annotations", "lifecycle", "beans", "advanced"]
      },
      {
        id: "ah-6",
        question: "What is @ConfigurationProperties and how does it differ from @Value for externalized configuration?",
        answer: `@ConfigurationProperties binds a hierarchy of properties to a strongly-typed POJO, while @Value injects individual property values via SpEL expressions.

\`\`\`java
// application.yml:
// mail:
//   host: smtp.example.com
//   port: 587
//   credentials:
//     username: user
//     password: secret

@ConfigurationProperties(prefix = "mail")
@Validated
public class MailProperties {

    @NotBlank
    private String host;

    @Min(1) @Max(65535)
    private int port = 25;

    private Credentials credentials = new Credentials();

    public static class Credentials {
        private String username;
        private String password;
        // getters/setters
    }
    // getters/setters
}

// Register it:
@SpringBootApplication
@EnableConfigurationProperties(MailProperties.class)
public class App { }
\`\`\`

**Comparison:**

| Feature | @Value | @ConfigurationProperties |
|---|---|---|
| Type safety | Manual via SpEL | Full (nested objects, lists, maps) |
| Validation | None | @Validated with JSR-380 |
| IDE support | Limited | Full with metadata processor |
| Relaxed binding | No | Yes (camelCase = kebab-case = env var) |
| Complex types | Hard | Easy |

Prefer @ConfigurationProperties for anything beyond a single simple value.`,
        difficulty: "hard",
        tags: ["annotations", "configuration", "properties", "best-practices"]
      },
      {
        id: "ah-7",
        question: "How does Spring handle circular dependencies, and what changed in Spring Boot 2.6+?",
        answer: `A circular dependency occurs when Bean A depends on Bean B, which depends on Bean A (directly or transitively).

**Spring Boot < 2.6:** Constructor injection circular dependencies always fail. Field/setter injection circular dependencies were silently resolved by creating a partially initialized proxy.

**Spring Boot 2.6+:** Circular dependencies are **banned by default**. The app fails to start with an informative error message. This prevents subtle initialization bugs.

\`\`\`
The dependencies of some of the beans in the application context form a cycle:
serviceA → serviceB → serviceA
\`\`\`

**Fixing circular dependencies:**

1. **Refactor** — extract the shared logic into a third bean.
2. **Use @Lazy** — one dependency is injected lazily (proxy created first):

\`\`\`java
@Service
public class ServiceA {
    private final ServiceB serviceB;

    public ServiceA(@Lazy ServiceB serviceB) {
        this.serviceB = serviceB;
    }
}
\`\`\`

3. **Use setter injection** for one direction.
4. Re-enable (discouraged): \`spring.main.allow-circular-references=true\`

**Root cause:** circular dependencies usually indicate a design problem — the two classes are too tightly coupled and should be decoupled.`,
        difficulty: "hard",
        tags: ["circular-dependency", "beans", "spring-boot", "advanced"]
      },
      {
        id: "ah-8",
        question: "Explain BeanPostProcessor and BeanFactoryPostProcessor and their use cases.",
        answer: `These two extension points allow you to hook into the Spring bean factory lifecycle at different stages.

**BeanFactoryPostProcessor** — runs **before** any beans are instantiated. You can modify bean definitions (metadata).

\`\`\`java
@Component
public class PropertyOverrider implements BeanFactoryPostProcessor {
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory factory) {
        BeanDefinition def = factory.getBeanDefinition("myService");
        def.setScope("prototype");  // change scope before instantiation
    }
}
\`\`\`

**BeanPostProcessor** — runs **after** each bean is instantiated and wired, before it's handed to the caller. Used to wrap beans in proxies.

\`\`\`java
@Component
public class TimingPostProcessor implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String name) {
        // called before @PostConstruct / afterPropertiesSet
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String name) {
        // AOP proxies are created here by AbstractAutoProxyCreator
        if (bean instanceof Service) {
            return Proxy.newProxyInstance(...); // wrap in timing proxy
        }
        return bean;
    }
}
\`\`\`

**Order of execution:**
BeanDefinitionRegistryPostProcessor → BeanFactoryPostProcessor → Bean instantiation → BeanPostProcessor.before → @PostConstruct → afterPropertiesSet → BeanPostProcessor.after`,
        difficulty: "hard",
        tags: ["spring-internals", "bean-lifecycle", "extension-points"]
      },
      {
        id: "ah-9",
        question: "What is @Primary vs @Qualifier, and how do you resolve bean ambiguity?",
        answer: `When multiple beans of the same type exist, Spring cannot decide which to inject — this causes \`NoUniqueBeanDefinitionException\`.

**Resolution strategies:**

**1. @Primary** — marks one bean as the default choice when no qualifier is specified:

\`\`\`java
@Bean @Primary
public DataSource primaryDataSource() { return masterDs(); }

@Bean
public DataSource replicaDataSource() { return replicaDs(); }

// Injected with no qualifier — gets primaryDataSource
@Autowired private DataSource dataSource;
\`\`\`

**2. @Qualifier** — explicitly names the bean to inject:

\`\`\`java
@Autowired
@Qualifier("replicaDataSource")
private DataSource readDataSource;
\`\`\`

**3. Custom qualifier annotation** — type-safe alternative:

\`\`\`java
@Target({FIELD, PARAMETER, METHOD})
@Retention(RUNTIME)
@Qualifier
public @interface Replica {}

@Bean @Replica
public DataSource replicaDataSource() { ... }

@Autowired @Replica
private DataSource readDataSource; // type-safe injection
\`\`\`

**4. Inject all** — collect all beans of a type into a collection:

\`\`\`java
@Autowired
private List<DataSource> allDataSources;

@Autowired
private Map<String, DataSource> dataSources; // key = bean name
\`\`\`

@Primary is a coarse global override; @Qualifier gives precise per-injection-site control.`,
        difficulty: "hard",
        tags: ["annotations", "beans", "qualifier", "ambiguity"]
      }
    ]
  },

  {
    id: "core-java",
    title: "Core Java Concepts",
    icon: "☕",
    questions: [
      {
        id: "cj-1",
        question: "What is the difference between == and .equals() in Java?",
        answer: `\`==\` compares **references** (memory addresses) for objects, or **values** for primitives.
\`.equals()\` compares **content/state** as defined by the class's implementation.

\`\`\`java
String a = new String("hello");
String b = new String("hello");

System.out.println(a == b);       // false — different objects in heap
System.out.println(a.equals(b));  // true  — same content

// String pool — literals may share the same reference
String x = "hello";
String y = "hello";
System.out.println(x == y);       // true  — same interned reference
\`\`\`

**Contract for equals():**
- Reflexive: \`a.equals(a)\` → true
- Symmetric: \`a.equals(b)\` ↔ \`b.equals(a)\`
- Transitive: if \`a.equals(b)\` and \`b.equals(c)\`, then \`a.equals(c)\`
- Consistent: same result when called repeatedly
- \`a.equals(null)\` → false

Always override \`hashCode()\` when you override \`equals()\` — failure violates HashMap/HashSet contracts.`,
        difficulty: "easy",
        tags: ["core-java", "equality", "strings"]
      },
      {
        id: "cj-2",
        question: "Explain Java's memory model: heap, stack, metaspace, and string pool.",
        answer: `**Stack** — per-thread, holds stack frames (local variables, method calls). LIFO, small, fast. Cleaned automatically when method returns.

**Heap** — shared among all threads; holds all objects (instances of classes). Managed by GC.

**Metaspace** (Java 8+, replaced PermGen) — native memory area holding class metadata (bytecode, method info). Grows dynamically by default.

**String Pool** — a special region inside the heap where string literals are interned. Calling \`"hello"\` always returns the same object from the pool.

\`\`\`java
// On the stack: reference 'name'
// On the heap: String object
// In the pool: the "Alice" literal is interned
String name = "Alice";

String s1 = "Alice";
String s2 = "Alice";
String s3 = new String("Alice"); // NOT interned, new heap object

s1 == s2       // true  (same pool ref)
s1 == s3       // false (different heap object)
s1 == s3.intern() // true (intern() returns pool ref)
\`\`\`

**Garbage collection** reclaims unreachable heap objects. Metaspace is collected when class loaders are unloaded.`,
        difficulty: "medium",
        tags: ["core-java", "jvm", "memory", "garbage-collection"]
      },
      {
        id: "cj-3",
        question: "What is the difference between checked and unchecked exceptions?",
        answer: `**Checked exceptions** extend \`Exception\` (not RuntimeException). The compiler forces callers to either catch them or declare \`throws\`.

**Unchecked exceptions** extend \`RuntimeException\` or \`Error\`. No compiler enforcement.

\`\`\`java
// Checked — must be handled or declared
public void readFile(String path) throws IOException {
    Files.readAllBytes(Paths.get(path));
}

// Unchecked — can propagate freely
public int divide(int a, int b) {
    if (b == 0) throw new ArithmeticException("Division by zero");
    return a / b;
}
\`\`\`

**When to use which:**
- Checked: caller can reasonably recover (file not found, network timeout).
- Unchecked: programming error that should not be caught (NPE, illegal argument, illegal state).

Spring's philosophy: translate all data-access checked exceptions (e.g., SQLException) to unchecked DataAccessException subclasses — callers don't need to handle exceptions they can't meaningfully recover from.`,
        difficulty: "easy",
        tags: ["core-java", "exceptions", "error-handling"]
      }
    ]
  },

  {
    id: "collections",
    title: "Java Collections",
    icon: "📦",
    questions: [
      {
        id: "col-1",
        question: "Compare ArrayList vs LinkedList — when to use each?",
        answer: `Both implement List. The right choice depends on the dominant operation:

| Operation | ArrayList | LinkedList |
|---|---|---|
| Random access (get by index) | O(1) | O(n) |
| Add/remove at end | O(1) amortized | O(1) |
| Add/remove at middle | O(n) — shifts elements | O(1) — pointer update |
| Memory overhead | Low (contiguous array) | High (node + 2 pointers each) |

\`\`\`java
// ArrayList — fast iteration, index access
List<String> names = new ArrayList<>(); // backed by array, resizes 1.5x when full

// LinkedList — frequent insertions at front/middle
// Also implements Deque — useful as a queue or stack
Deque<String> deque = new LinkedList<>();
\`\`\`

**In practice:** ArrayList wins for most use cases because of better cache locality and lower memory overhead. Only reach for LinkedList when you have a proven requirement for O(1) front insertions (e.g., implementing a queue), and even then, consider ArrayDeque — it beats LinkedList for queue operations.`,
        difficulty: "easy",
        tags: ["collections", "list", "performance"]
      },
      {
        id: "col-2",
        question: "How does HashMap work internally? What are the key changes in Java 8?",
        answer: `HashMap stores entries in an array of "buckets." The bucket index is computed as \`(n - 1) & hash(key)\` where n is the array length (always a power of 2).

**Before Java 8:** collisions were handled via a linked list in each bucket. Worst case: O(n) lookup when many keys collide.

**Java 8+:** when a bucket's linked list exceeds **8 entries** (and total capacity ≥ 64), it is converted to a **red-black tree** → O(log n) worst case.

\`\`\`java
Map<String, Integer> map = new HashMap<>(16, 0.75f);
//                                        ↑ initial capacity, load factor

// When size > capacity * loadFactor (16 * 0.75 = 12),
// HashMap REHASHES — doubles capacity and remaps all entries.
\`\`\`

**Key internals:**
1. \`hashCode()\` of key → raw hash → spreads high bits down with XOR.
2. Bucket index = hash & (capacity - 1).
3. On collision: same bucket → linked list or tree.
4. \`equals()\` used to find the exact key within the bucket.

**Gotcha:** mutable keys that change hashCode after insertion will "lose" the entry — the map can't find it.`,
        difficulty: "medium",
        tags: ["collections", "hashmap", "internals", "java8"]
      },
      {
        id: "col-3",
        question: "What is the difference between HashMap, LinkedHashMap, TreeMap, and ConcurrentHashMap?",
        answer: `All four implement Map but differ in ordering, thread-safety, and performance:

| | HashMap | LinkedHashMap | TreeMap | ConcurrentHashMap |
|---|---|---|---|---|
| Ordering | None | Insertion or access order | Sorted by key | None |
| Null keys | 1 allowed | 1 allowed | Not allowed | Not allowed |
| Thread-safe | No | No | No | Yes (segment locking / CAS) |
| Get/Put | O(1) avg | O(1) avg | O(log n) | O(1) avg |
| Use case | General | LRU cache, ordered iteration | Range queries, sorted output | Concurrent access |

\`\`\`java
// LRU cache pattern with LinkedHashMap
Map<Integer, String> lru = new LinkedHashMap<>(16, 0.75f, true) {
    // accessOrder=true + override removeEldestEntry
    protected boolean removeEldestEntry(Map.Entry<Integer, String> e) {
        return size() > 100; // evict oldest when > 100 entries
    }
};

// Sorted, range query
TreeMap<String, Integer> tree = new TreeMap<>();
tree.subMap("apple", "mango"); // keys from apple to mango

// Thread-safe, high-concurrency
ConcurrentHashMap<String, Long> concurrent = new ConcurrentHashMap<>();
concurrent.merge("clicks", 1L, Long::sum); // atomic compute
\`\`\``,
        difficulty: "medium",
        tags: ["collections", "map", "concurrency", "comparison"]
      }
    ]
  },

  {
    id: "java8",
    title: "Java 8+ Features",
    icon: "🚀",
    questions: [
      {
        id: "j8-1",
        question: "What are functional interfaces and what built-in ones does Java provide?",
        answer: `A **functional interface** has exactly one abstract method (SAM — Single Abstract Method). It may have default/static methods. @FunctionalInterface enforces this at compile time.

\`\`\`java
@FunctionalInterface
public interface Transformer<T, R> {
    R transform(T input);
    // can have default methods
    default Transformer<T, R> andLog() {
        return t -> { R r = transform(t); System.out.println(r); return r; };
    }
}
\`\`\`

**Built-in functional interfaces (java.util.function):**

| Interface | Signature | Use case |
|---|---|---|
| Predicate<T> | T → boolean | Filtering |
| Function<T,R> | T → R | Transformation |
| Consumer<T> | T → void | Side effects |
| Supplier<T> | () → T | Lazy construction |
| BiFunction<T,U,R> | T,U → R | Two-arg transformation |
| UnaryOperator<T> | T → T | In-place transforms |
| BinaryOperator<T> | T,T → T | Reduction |

\`\`\`java
Predicate<String> isLong = s -> s.length() > 10;
Function<String, Integer> length = String::length;
Consumer<String> printer = System.out::println;
Supplier<List<String>> listFactory = ArrayList::new;

// Composing
Function<String, String> upper = String::toUpperCase;
Function<String, Integer> upperLength = upper.andThen(length);
\`\`\``,
        difficulty: "medium",
        tags: ["java8", "functional", "lambda", "streams"]
      },
      {
        id: "j8-2",
        question: "Explain the Stream API — intermediate vs terminal operations, and lazy evaluation.",
        answer: `A Stream is a pipeline that processes data lazily. Nothing runs until a terminal operation is invoked.

**Intermediate operations** (lazy, return Stream):
\`filter\`, \`map\`, \`flatMap\`, \`distinct\`, \`sorted\`, \`peek\`, \`limit\`, \`skip\`

**Terminal operations** (eager, trigger pipeline):
\`collect\`, \`forEach\`, \`count\`, \`reduce\`, \`findFirst\`, \`anyMatch\`, \`toList\` (Java 16+)

\`\`\`java
List<String> result = employees.stream()
    .filter(e -> e.getDepartment().equals("Engineering"))  // intermediate
    .filter(e -> e.getSalary() > 80_000)                   // intermediate
    .map(Employee::getName)                                 // intermediate
    .sorted()                                               // intermediate
    .limit(10)                                              // intermediate
    .collect(Collectors.toList());                          // TERMINAL — pipeline runs NOW

// Short-circuiting: stops as soon as condition is met
Optional<Employee> first = employees.stream()
    .filter(e -> e.getSalary() > 100_000)
    .findFirst();  // may not process all elements

// Parallel stream — uses ForkJoinPool.commonPool()
long count = bigList.parallelStream()
    .filter(expensive::check)
    .count();
\`\`\`

Streams are **not reusable** — a second terminal operation on the same stream throws \`IllegalStateException\`.`,
        difficulty: "medium",
        tags: ["java8", "streams", "functional", "performance"]
      },
      {
        id: "j8-3",
        question: "What is Optional and how should it be used correctly?",
        answer: `Optional<T> is a container that may or may not hold a non-null value. It makes the possibility of absence explicit in the API contract.

\`\`\`java
// Creating
Optional<String> present = Optional.of("hello");        // throws if null
Optional<String> maybe   = Optional.ofNullable(getValue()); // ok if null
Optional<String> empty   = Optional.empty();

// Consuming — prefer pipeline style
String result = maybe
    .filter(s -> s.length() > 3)
    .map(String::toUpperCase)
    .orElse("DEFAULT");

// Chaining optionals
Optional<Address> address = userRepo.findById(id)
    .map(User::getAddress);

// Execute if present
maybe.ifPresent(s -> System.out.println("Value: " + s));

// Java 9+
maybe.ifPresentOrElse(
    s -> System.out.println("Found: " + s),
    () -> System.out.println("Not found")
);
\`\`\`

**What NOT to do:**
\`\`\`java
// Don't use Optional.get() without isPresent() — defeats the purpose
String bad = maybe.get(); // throws NoSuchElementException if empty

// Don't use Optional as method parameter or field — use overloads instead
void process(Optional<String> name) { ... } // BAD
void process(String name) { ... }           // GOOD
void process() { ... }                      // GOOD (overload)

// Don't use Optional with collections — an empty list beats Optional<List>
Optional<List<String>> bad2 = ...
List<String> good = ...;
\`\`\``,
        difficulty: "medium",
        tags: ["java8", "optional", "null-safety"]
      }
    ]
  },

  {
    id: "concurrency",
    title: "Multithreading & Concurrency",
    icon: "🧵",
    questions: [
      {
        id: "mc-1",
        question: "What is the difference between Thread, Runnable, and Callable?",
        answer: `**Thread** — a class you can extend or use directly. Represents an OS thread.

**Runnable** — a functional interface (\`void run()\`) representing a task with no return value and no checked exception.

**Callable<V>** — a functional interface (\`V call() throws Exception\`) representing a task that returns a value and can throw checked exceptions.

\`\`\`java
// Thread — direct subclass (inflexible, ties task to thread)
Thread t = new Thread(() -> System.out.println("Running"));
t.start();

// Runnable — task without result
Runnable r = () -> System.out.println("Task");
new Thread(r).start();
ExecutorService exec = Executors.newFixedThreadPool(4);
exec.submit(r);

// Callable — task with result
Callable<Integer> c = () -> {
    Thread.sleep(100);
    return 42;
};
Future<Integer> future = exec.submit(c);
Integer result = future.get(); // blocks until done
\`\`\`

**In practice:** prefer Callable + ExecutorService over raw Thread creation. Use CompletableFuture for async composition.`,
        difficulty: "easy",
        tags: ["concurrency", "threads", "executors"]
      },
      {
        id: "mc-2",
        question: "Explain volatile, synchronized, and the Java Memory Model.",
        answer: `**Java Memory Model (JMM)** defines how threads interact through memory. Without synchronization, threads may see stale cached values.

**volatile** — guarantees visibility (changes are immediately visible to all threads) and prevents instruction reordering. Does NOT guarantee atomicity for compound operations (check-then-act).

\`\`\`java
// Without volatile, other threads may never see updated value
private volatile boolean running = true;

public void stop() { running = false; }
public void run() { while (running) { /* process */ } }
\`\`\`

**synchronized** — provides both **visibility** and **atomicity** (mutual exclusion). Only one thread holds the monitor at a time.

\`\`\`java
public class Counter {
    private int count = 0;

    public synchronized void increment() { count++; }
    public synchronized int get() { return count; }

    // Equivalent block synchronization:
    public void decrement() {
        synchronized (this) { count--; }
    }
}
\`\`\`

**Happens-before rules:**
- Unlock happens-before subsequent lock of same monitor
- volatile write happens-before subsequent read of same variable
- Thread.start() happens-before actions in the started thread
- Actions in a thread happen-before Thread.join() returns

For simple counters, prefer **AtomicInteger** over synchronized — it uses CAS (Compare-And-Swap) hardware instructions, lower overhead.`,
        difficulty: "medium",
        tags: ["concurrency", "volatile", "synchronized", "jmm"]
      },
      {
        id: "mc-3",
        question: "What is CompletableFuture and how does it improve on Future?",
        answer: `**Future<T>** (Java 5) — can hold an async result but is limited: no callbacks, no composition, blocking \`get()\`.

**CompletableFuture<T>** (Java 8) — implements both Future and CompletionStage. Supports:
- Non-blocking callbacks
- Chaining and composition
- Exception handling in the pipeline
- Manual completion

\`\`\`java
CompletableFuture<Order> future = CompletableFuture
    // Run async in ForkJoinPool.commonPool() (or custom executor)
    .supplyAsync(() -> orderService.fetch(orderId), executor)
    // Transform result
    .thenApply(order -> enricher.enrich(order))
    // Side effect (consume result)
    .thenAccept(order -> notifier.notify(order))
    // Handle exceptions without breaking the chain
    .exceptionally(ex -> {
        log.error("Failed", ex);
        return fallbackOrder();
    });

// Combining two futures
CompletableFuture<User> userFuture = CompletableFuture.supplyAsync(() -> userRepo.find(id));
CompletableFuture<List<Order>> ordersFuture = CompletableFuture.supplyAsync(() -> orderRepo.findByUser(id));

CompletableFuture<UserProfile> profile = userFuture.thenCombine(
    ordersFuture,
    (user, orders) -> new UserProfile(user, orders)
);

// Wait for all / any
CompletableFuture.allOf(f1, f2, f3).join();
CompletableFuture.anyOf(f1, f2, f3).join();
\`\`\``,
        difficulty: "medium",
        tags: ["concurrency", "completablefuture", "async", "java8"]
      }
    ]
  }
];
