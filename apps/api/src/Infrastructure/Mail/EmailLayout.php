<?php

declare(strict_types=1);

namespace App\Infrastructure\Mail;

/** Shared light layout for Synqo messages; callers supply already-decided content, never markup. */
final class EmailLayout
{
    /**
     * @param list<string> $paragraphs
     * @return array{html: string, text: string}
     */
    public function render(string $label, string $heading, array $paragraphs, string $actionLabel, string $actionUrl, string $footer): array
    {
        $e = static fn(string $value): string => htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, 'UTF-8');
        $body = '';
        foreach ($paragraphs as $index => $paragraph) {
            $body .= sprintf('<p style="margin:0 0 %dpx;color:#364566;font-size:16px;line-height:1.6;">%s</p>', $index === array_key_last($paragraphs) ? 24 : 12, $e($paragraph));
        }
        $url = $e($actionUrl);
        $html = <<<HTML
<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light only"><title>{$e($heading)}</title></head>
<body style="margin:0;background:#f3f6fc;color:#1d2546;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f3f6fc;padding:28px 12px;"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e1e8f5;border-radius:20px;">
<tr><td style="padding:28px 32px 0;"><p style="margin:0;color:#3441a8;font-size:22px;font-weight:700;letter-spacing:-.04em;">synqo<span style="color:#06a7b2;">.</span></p></td></tr>
<tr><td style="padding:24px 32px 32px;">
<p style="margin:0 0 10px;color:#3556a2;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">{$e($label)}</p>
<h1 style="margin:0 0 16px;color:#182454;font-size:28px;line-height:1.2;">{$e($heading)}</h1>
{$body}
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#3344ad" style="border-radius:10px;"><a href="{$url}" style="display:inline-block;padding:14px 22px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">{$e($actionLabel)}&nbsp; &rarr;</a></td></tr></table>
<p style="margin:28px 0 8px;color:#4d5a77;font-size:13px;line-height:1.5;">Si el botón no funciona, copia y abre este enlace:</p>
<p style="margin:0;overflow-wrap:anywhere;word-break:break-word;font-size:13px;line-height:1.5;"><a href="{$url}" style="color:#2647a8;text-decoration:underline;">{$url}</a></p>
</td></tr>
<tr><td style="border-top:1px solid #e1e8f5;padding:19px 32px 25px;color:#64718e;font-size:12px;line-height:1.5;">{$e($footer)}</td></tr>
</table></td></tr></table>
</body>
</html>
HTML;
        $text = $label . "\n\n" . $heading . "\n\n" . implode("\n\n", $paragraphs) . "\n\n" . $actionLabel . ': ' . $actionUrl . "\n\n--\n" . $footer . "\n";

        return ['html' => $html, 'text' => $text];
    }
}
