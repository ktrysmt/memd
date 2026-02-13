# Syntax Highlighting Test

## JavaScript Code

```javascript
function hello(name) {
  const greeting = `Hello, ${name}!`;
  console.log(greeting);
  return greeting;
}

// Call the function
hello('World');
```

## Python Code

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Generate fibonacci sequence
for i in range(10):
    print(fibonacci(i))
```

## Bash Script

```bash
#!/bin/bash
echo "Hello from bash"
for i in {1..5}; do
  echo "Count: $i"
done
```

## TypeScript

```typescript
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: 'Alice',
  age: 30
};

console.log(user);
```
