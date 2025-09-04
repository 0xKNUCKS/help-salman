# HTMX + Rust Examples

This document provides examples of how to extend the HTMX + Rust application with additional features.

## Example 1: Todo List

### Add Todo Handler
```rust
// src/handlers.rs
pub async fn add_todo(State(state): State<AppState>) -> impl IntoResponse {
    let mut todos = state.todos.lock().unwrap();
    let new_todo = Todo {
        id: todos.len() as u32,
        text: "New Todo".to_string(),
        completed: false,
    };
    todos.push(new_todo);
    
    let template = TodoListTemplate { todos: todos.clone() };
    Html(template.render().unwrap())
}
```

### Todo Template
```html
<!-- templates/todo_list.html -->
<div class="todo-list">
    {% for todo in todos %}
    <div class="todo-item {% if todo.completed %}completed{% endif %}">
        <span>{{ todo.text }}</span>
        <button hx-post="/toggle/{{ todo.id }}" 
                hx-target=".todo-list"
                hx-swap="innerHTML">
            {% if todo.completed %}Undo{% else %}Complete{% endif %}
        </button>
    </div>
    {% endfor %}
</div>
```

## Example 2: Search with Debouncing

### Search Handler
```rust
// src/handlers.rs
pub async fn search(Query(params): Query<HashMap<String, String>>) -> impl IntoResponse {
    let query = params.get("q").unwrap_or(&"".to_string());
    let results = search_items(query).await;
    
    let template = SearchResultsTemplate { results };
    Html(template.render().unwrap())
}
```

### Search Template with HTMX
```html
<!-- templates/search.html -->
<input type="text" 
       name="q" 
       placeholder="Search..."
       hx-get="/search"
       hx-trigger="keyup changed delay:500ms"
       hx-target="#search-results"
       hx-indicator="#loading">

<div id="search-results">
    <!-- Results will be loaded here -->
</div>

<div id="loading" class="htmx-indicator">
    Searching...
</div>
```

## Example 3: Infinite Scroll

### Pagination Handler
```rust
// src/handlers.rs
pub async fn load_more(Query(params): Query<HashMap<String, String>>) -> impl IntoResponse {
    let page: usize = params.get("page").unwrap_or(&"1".to_string()).parse().unwrap();
    let items = load_items_page(page).await;
    
    let template = ItemsTemplate { items, has_more: page < 10 };
    Html(template.render().unwrap())
}
```

### Infinite Scroll Template
```html
<!-- templates/items.html -->
<div class="items-container">
    {% for item in items %}
    <div class="item">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
    </div>
    {% endfor %}
    
    {% if has_more %}
    <div hx-get="/load-more?page={{ page + 1 }}"
         hx-trigger="intersect once"
         hx-swap="beforeend"
         hx-indicator="#loading">
        <div id="loading" class="htmx-indicator">Loading more...</div>
    </div>
    {% endif %}
</div>
```

## Example 4: Real-time Updates with Server-Sent Events

### SSE Handler
```rust
// src/handlers.rs
pub async fn sse_updates() -> impl IntoResponse {
    let stream = async_stream::stream! {
        loop {
            yield Ok::<_, std::io::Error>(format!(
                "data: {}\n\n",
                serde_json::to_string(&get_updates().await).unwrap()
            ));
            tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
        }
    };
    
    axum::response::sse::EventStream::new(stream)
}
```

### SSE Template
```html
<!-- templates/updates.html -->
<div hx-ext="sse" 
     sse-connect="/updates"
     sse-swap="message">
    <div id="updates">
        <!-- Updates will be loaded here -->
    </div>
</div>
```

## Example 5: Form Validation

### Validation Handler
```rust
// src/handlers.rs
pub async fn validate_form(Form(form): Form<UserForm>) -> impl IntoResponse {
    let mut errors = Vec::new();
    
    if form.email.is_empty() {
        errors.push("Email is required".to_string());
    }
    
    if form.password.len() < 8 {
        errors.push("Password must be at least 8 characters".to_string());
    }
    
    if errors.is_empty() {
        // Process valid form
        let template = SuccessTemplate { message: "Form submitted successfully!" };
        Html(template.render().unwrap())
    } else {
        let template = FormTemplate { errors, form };
        Html(template.render().unwrap())
    }
}
```

### Form Template with Validation
```html
<!-- templates/form.html -->
<form hx-post="/validate"
      hx-target="#form-result"
      hx-swap="innerHTML">
    
    <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" name="email" value="{{ form.email }}">
        {% if errors.email %}
        <span class="error">{{ errors.email }}</span>
        {% endif %}
    </div>
    
    <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" name="password">
        {% if errors.password %}
        <span class="error">{{ errors.password }}</span>
        {% endif %}
    </div>
    
    <button type="submit">Submit</button>
</form>

<div id="form-result">
    <!-- Validation results will appear here -->
</div>
```

## Example 6: File Upload with Progress

### Upload Handler
```rust
// src/handlers.rs
pub async fn upload_file(mut multipart: Multipart) -> impl IntoResponse {
    while let Some(field) = multipart.next_field().await.unwrap() {
        let filename = field.file_name().unwrap().to_string();
        let data = field.bytes().await.unwrap();
        
        // Save file
        tokio::fs::write(&format!("uploads/{}", filename), data).await.unwrap();
    }
    
    let template = UploadSuccessTemplate { message: "File uploaded successfully!" };
    Html(template.render().unwrap())
}
```

### Upload Template
```html
<!-- templates/upload.html -->
<form hx-post="/upload"
      hx-encoding="multipart/form-data"
      hx-target="#upload-result"
      hx-indicator="#upload-progress">
    
    <input type="file" name="file" accept="image/*">
    <button type="submit">Upload</button>
    
    <div id="upload-progress" class="htmx-indicator">
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
        Uploading...
    </div>
</form>

<div id="upload-result">
    <!-- Upload result will appear here -->
</div>
```

## Best Practices

1. **Error Handling**: Always handle errors gracefully in your handlers
2. **Loading States**: Use `hx-indicator` to show loading states
3. **Debouncing**: Use `delay` for search inputs to avoid too many requests
4. **Validation**: Validate on both client and server side
5. **Security**: Sanitize user inputs and validate file uploads
6. **Performance**: Use appropriate caching strategies
7. **Accessibility**: Ensure your HTMX interactions are accessible

## Common HTMX Attributes

- `hx-get` / `hx-post` / `hx-put` / `hx-delete`: HTTP methods
- `hx-target`: Element to update
- `hx-swap`: How to swap content (`innerHTML`, `outerHTML`, `beforeend`, etc.)
- `hx-trigger`: When to trigger the request
- `hx-indicator`: Loading indicator element
- `hx-push-url`: Update browser URL
- `hx-preserve`: Preserve elements across swaps
- `hx-sync`: Synchronize requests
- `hx-confirm`: Show confirmation dialog
