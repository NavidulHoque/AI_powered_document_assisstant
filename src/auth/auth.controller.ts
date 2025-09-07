import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {  LoginDto, RegistrationDto,  LogoutDto } from './dto';
import { AuthGuard } from './guard';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) { }

    @Post("/register")
    register(@Body() dto: RegistrationDto) {
        return this.authService.register(dto)
    }

    @Post("/login")
    @HttpCode(200)
    login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        return this.authService.login(dto, res)
    }

    @Get("/refreshAccessToken")
    refreshAccessToken(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ){
        const refreshToken = req.cookies['refresh_token']
        return this.authService.refreshAccessToken(refreshToken, res)
    }

    @UseGuards(AuthGuard)
    @Post("/logout")
    @HttpCode(200)
    logout(
        @Body() dto: LogoutDto,
        @Res({ passthrough: true }) res: Response
    ){
        return this.authService.logout(dto, res)
    }
}