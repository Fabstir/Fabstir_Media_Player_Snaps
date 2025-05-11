@echo off
pushd "%~dp0"
xcopy "packages\site\node_modules\viem" ^
      "node_modules\@particle-network\auth-core\node_modules\viem" ^
      /E /I /H /Y
	  
xcopy "packages\site\node_modules\abitype" ^
      "node_modules\@particle-network\auth-core\node_modules\abitype" ^
      /E /I /H /Y
	  
popd
