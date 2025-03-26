    // Handles case when email already exists in the database
    it('should call next with an error when email already exists', async () => {
        // Mock request and response
        const req = {
          body: {
            email: 'existing@example.com',
            password: 'password123',
            firstName: 'Jane',
            lastName: 'Doe',
            phone: '0123456789'
          }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const next = jest.fn();
  
        // Mock bcrypt
        bcrypt.hashSync = jest.fn().mockReturnValue('hashedPassword');
  
        // Mock Role.findOne
        const mockRole = { _id: 'memberRoleId', name: 'MEMBER' };
        Role.findOne = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRole)
        });
  
        // Mock User.create to throw an error for existing email
        const error = new Error('Email already exists');
        User.create = jest.fn().mockRejectedValue(error);
  
        // Call the function
        await signUp(req, res, next);
  
        // Assertions
        expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
          email: 'existing@example.com',
          password: 'hashedPassword',
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '84123456789'
        }));
        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });

          // Successfully creates a new user with MEMBER role when no roles are specified
    it('should create a new user with MEMBER role when no roles are specified', async () => {
        // Mock request and response
        const req = {
          body: {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            phone: '0123456789'
          }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const next = jest.fn();
    
        // Mock bcrypt
        bcrypt.hashSync = jest.fn().mockReturnValue('hashedPassword');
    
        // Mock Role.findOne
        const mockRole = { _id: 'memberRoleId', name: 'MEMBER' };
        Role.findOne = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRole)
        });
    
        // Mock User.create
        const createdUser = {
          email: 'test@example.com',
          password: 'hashedPassword',
          firstName: 'John',
          lastName: 'Doe',
          phone: '84123456789',
          roles: ['memberRoleId']
        };
        User.create = jest.fn().mockResolvedValue(createdUser);
    
        // Call the function
        await signUp(req, res, next);
    
        // Assertions
        expect(Role.findOne).toHaveBeenCalledWith({ name: 'MEMBER' });
        expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
          email: 'test@example.com',
          password: 'hashedPassword',
          firstName: 'John',
          lastName: 'Doe',
          phone: '84123456789',
          roles: ['memberRoleId']
        }));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(createdUser);
        expect(next).not.toHaveBeenCalled();
      });