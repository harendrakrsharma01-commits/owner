<?php
require __DIR__ . '/../app/lib/AgeDobPage.php';
echo (new AgeDobPage('birthday-countdown-calculator'))->render();
