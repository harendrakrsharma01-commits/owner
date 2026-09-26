<?php
require __DIR__ . '/../app/lib/AgeDobPage.php';
echo (new AgeDobPage('age-milestone-calculator'))->render();
