import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 409, description: 'Email or Clerk ID already exists.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'department', required: false })
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take?: number,
    @Query('role') role?: string,
    @Query('department') department?: string,
  ) {
    return this.usersService.findAll({
      skip,
      take,
      role,
      department,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('clerk/:clerkId')
  @ApiOperation({ summary: 'Get a user by Clerk ID' })
  @ApiParam({ name: 'clerkId', description: 'Clerk User ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findByClerkId(@Param('clerkId') clerkId: string) {
    return this.usersService.findByClerkId(clerkId);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get a user by email' })
  @ApiParam({ name: 'email', description: 'User email' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get('role/:role')
  @ApiOperation({ summary: 'Get all users by role' })
  @ApiParam({ name: 'role', description: 'User role' })
  @ApiResponse({
    status: 200,
    description: 'Returns users with specified role.',
  })
  @ApiResponse({ status: 404, description: 'No users found with this role.' })
  findByRole(@Param('role') role: string) {
    return this.usersService.findByRole(role);
  }

  @Get('department/:department')
  @ApiOperation({ summary: 'Get all users by department' })
  @ApiParam({ name: 'department', description: 'Department name' })
  @ApiResponse({
    status: 200,
    description: 'Returns users in specified department.',
  })
  @ApiResponse({
    status: 404,
    description: 'No users found in this department.',
  })
  findByDepartment(@Param('department') department: string) {
    return this.usersService.findByDepartment(department);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 409, description: 'Email or Clerk ID already exists.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
} 