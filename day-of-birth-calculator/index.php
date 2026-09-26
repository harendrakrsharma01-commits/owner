<?php
require __DIR__ . '/../app/lib/AgeDobPage.php';
echo (new AgeDobPage('day-of-birth-calculator'))->render();
