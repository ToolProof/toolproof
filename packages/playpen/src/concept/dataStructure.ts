

interface __DataStructure<T extends __Operation> {
    allowedOperations: T[];  // Array of allowed operations
  }
  
  interface __Array extends __DataStructure<__Insert | __Delete> {
    // Arrays allow both Insert and Delete operations
  }
  
  interface __Stack extends __DataStructure<__Push | __Pop> {
    // Stacks only allow Push and Pop operations
  }
  
  interface __Operation {
    type: string;  // A general type that all operations will extend
  }
  
  interface __Insert extends __Operation {
    type: 'Insert' | 'Push';  // Allowable types for Insert operations
  }
  
  interface __Delete extends __Operation {
    type: 'Delete' | 'Pop';  // Allowable types for Delete operations
  }
  
  interface __Push extends __Insert {
    type: 'Push';  // Specific to Push
  }
  
  interface __Pop extends __Delete {
    type: 'Pop';  // Specific to Pop
  }